from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import httpx
import os
import json
from datetime import datetime
from pathlib import Path

from config import settings
from core.agent import agent

router = APIRouter()

# --- Persistence ---
CONNECTED_REPOS_FILE = Path(__file__).parent.parent / "connected_repos.json"


def _load_connected_repos() -> dict:
    """Load connected repos from JSON file."""
    if CONNECTED_REPOS_FILE.exists():
        try:
            with open(CONNECTED_REPOS_FILE, "r") as f:
                return json.load(f)
        except (json.JSONDecodeError, IOError):
            return {}
    return {}


def _save_connected_repos(repos: dict):
    """Save connected repos to JSON file."""
    with open(CONNECTED_REPOS_FILE, "w") as f:
        json.dump(repos, f, indent=2)


def _get_headers() -> dict:
    """Get GitHub API headers with token if available."""
    headers = {"Accept": "application/vnd.github.v3+json"}
    token = settings.github_access_token
    if token:
        headers["Authorization"] = f"Bearer {token}"
    return headers


# --- Models ---

class ConnectRepoRequest(BaseModel):
    repo_url: str  # e.g. "https://github.com/facebook/react" or "facebook/react"


class DisconnectRepoRequest(BaseModel):
    owner: str
    repo: str


# --- Endpoints ---

@router.post("/connect")
async def connect_repo(request: ConnectRepoRequest):
    """
    Connect a public GitHub repository.
    Accepts full URL or owner/repo format.
    Validates the repo exists, then persists it.
    """
    raw = request.repo_url.strip().rstrip("/")

    # Parse owner/repo from various formats
    if "github.com" in raw:
        # Extract from URL: https://github.com/owner/repo
        parts = raw.split("github.com/")[-1].split("/")
        if len(parts) < 2:
            raise HTTPException(status_code=400, detail="Invalid GitHub URL. Expected format: https://github.com/owner/repo")
        owner, repo = parts[0], parts[1]
    elif "/" in raw:
        parts = raw.split("/")
        owner, repo = parts[0], parts[1]
    else:
        raise HTTPException(status_code=400, detail="Invalid format. Use https://github.com/owner/repo or owner/repo")

    # Remove .git suffix if present
    repo = repo.replace(".git", "")
    key = f"{owner}/{repo}"

    # Check if already connected
    connected = _load_connected_repos()
    if key in connected:
        return {"message": f"Repository {key} is already connected.", "repo": connected[key]}

    # Validate repo exists on GitHub
    async with httpx.AsyncClient(timeout=15.0) as client:
        response = await client.get(
            f"https://api.github.com/repos/{owner}/{repo}",
            headers=_get_headers()
        )
        if response.status_code == 404:
            raise HTTPException(status_code=404, detail=f"Repository {key} not found on GitHub.")
        if response.status_code != 200:
            raise HTTPException(status_code=response.status_code, detail="Failed to validate repository on GitHub.")

        data = response.json()

    # Store repo
    repo_entry = {
        "owner": owner,
        "repo": repo,
        "full_name": data.get("full_name", key),
        "name": data.get("name", repo),
        "description": data.get("description", ""),
        "language": data.get("language", "Unknown"),
        "stars": data.get("stargazers_count", 0),
        "forks": data.get("forks_count", 0),
        "open_issues": data.get("open_issues_count", 0),
        "default_branch": data.get("default_branch", "main"),
        "last_push": data.get("pushed_at", ""),
        "html_url": data.get("html_url", ""),
        "connected_at": datetime.utcnow().isoformat(),
    }

    connected[key] = repo_entry
    _save_connected_repos(connected)

    return {"message": f"Successfully connected {key}.", "repo": repo_entry}


@router.post("/disconnect")
async def disconnect_repo(request: DisconnectRepoRequest):
    """Remove a connected repository."""
    key = f"{request.owner}/{request.repo}"
    connected = _load_connected_repos()

    if key not in connected:
        raise HTTPException(status_code=404, detail=f"Repository {key} is not connected.")

    del connected[key]
    _save_connected_repos(connected)

    return {"message": f"Successfully disconnected {key}."}


@router.get("/repos")
async def get_connected_repos():
    """List all connected repositories."""
    connected = _load_connected_repos()
    return list(connected.values())


@router.get("/repos/{owner}/{repo}/info")
async def get_repo_info(owner: str, repo: str):
    """Fetch fresh repo metadata from GitHub."""
    async with httpx.AsyncClient(timeout=15.0) as client:
        response = await client.get(
            f"https://api.github.com/repos/{owner}/{repo}",
            headers=_get_headers()
        )
        if response.status_code != 200:
            raise HTTPException(status_code=response.status_code, detail="Failed to fetch repository info.")
        data = response.json()

    return {
        "owner": owner,
        "repo": repo,
        "full_name": data.get("full_name"),
        "name": data.get("name"),
        "description": data.get("description"),
        "language": data.get("language", "Unknown"),
        "stars": data.get("stargazers_count", 0),
        "forks": data.get("forks_count", 0),
        "open_issues": data.get("open_issues_count", 0),
        "default_branch": data.get("default_branch", "main"),
        "last_push": data.get("pushed_at", ""),
        "html_url": data.get("html_url", ""),
        "topics": data.get("topics", []),
        "size": data.get("size", 0),
        "watchers": data.get("watchers_count", 0),
        "created_at": data.get("created_at", ""),
        "updated_at": data.get("updated_at", ""),
    }


@router.get("/repos/{owner}/{repo}/commits")
async def get_repo_commits(owner: str, repo: str, per_page: int = 20):
    """Fetch recent commits with file stats."""
    async with httpx.AsyncClient(timeout=15.0) as client:
        response = await client.get(
            f"https://api.github.com/repos/{owner}/{repo}/commits?per_page={per_page}",
            headers=_get_headers()
        )
        if response.status_code != 200:
            raise HTTPException(status_code=response.status_code, detail="Failed to fetch commits.")

        commits_raw = response.json()

    commits = []
    for c in commits_raw:
        commit_data = c.get("commit", {})
        author_data = commit_data.get("author", {})
        committer = c.get("author") or {}

        commits.append({
            "sha": c.get("sha", "")[:7],
            "full_sha": c.get("sha", ""),
            "message": commit_data.get("message", "").split("\n")[0],  # First line only
            "author": author_data.get("name", "Unknown"),
            "author_avatar": committer.get("avatar_url", ""),
            "date": author_data.get("date", ""),
            "html_url": c.get("html_url", ""),
            "stats": c.get("stats", {}),  # additions, deletions, total — only in detail endpoint
        })

    return commits


@router.get("/repos/{owner}/{repo}/workflows")
async def get_repo_workflows(owner: str, repo: str):
    """Fetch GitHub Actions workflow definitions."""
    async with httpx.AsyncClient(timeout=15.0) as client:
        response = await client.get(
            f"https://api.github.com/repos/{owner}/{repo}/actions/workflows",
            headers=_get_headers()
        )
        if response.status_code != 200:
            # Repo may not have workflows
            return {"workflows": [], "total_count": 0}

        data = response.json()

    workflows = []
    for w in data.get("workflows", []):
        workflows.append({
            "id": w.get("id"),
            "name": w.get("name", ""),
            "state": w.get("state", ""),
            "path": w.get("path", ""),
            "created_at": w.get("created_at", ""),
            "updated_at": w.get("updated_at", ""),
            "html_url": w.get("html_url", ""),
        })

    return {"workflows": workflows, "total_count": data.get("total_count", 0)}


@router.get("/repos/{owner}/{repo}/runs")
async def get_repo_runs(owner: str, repo: str, per_page: int = 20):
    """Fetch recent workflow runs (build history)."""
    async with httpx.AsyncClient(timeout=15.0) as client:
        response = await client.get(
            f"https://api.github.com/repos/{owner}/{repo}/actions/runs?per_page={per_page}",
            headers=_get_headers()
        )
        if response.status_code != 200:
            return {"runs": [], "total_count": 0}

        data = response.json()

    runs = []
    for r in data.get("workflow_runs", []):
        # Calculate duration if available
        created = r.get("created_at", "")
        updated = r.get("updated_at", "")
        duration = 0
        if created and updated:
            try:
                t1 = datetime.fromisoformat(created.replace("Z", "+00:00"))
                t2 = datetime.fromisoformat(updated.replace("Z", "+00:00"))
                duration = int((t2 - t1).total_seconds())
            except Exception:
                duration = 0

        runs.append({
            "id": r.get("id"),
            "name": r.get("name", ""),
            "head_branch": r.get("head_branch", ""),
            "head_sha": r.get("head_sha", "")[:7],
            "status": r.get("status", ""),       # queued, in_progress, completed
            "conclusion": r.get("conclusion", ""),  # success, failure, cancelled, etc.
            "created_at": created,
            "updated_at": updated,
            "duration": duration,
            "html_url": r.get("html_url", ""),
            "event": r.get("event", ""),
            "actor": {
                "login": r.get("actor", {}).get("login", ""),
                "avatar_url": r.get("actor", {}).get("avatar_url", ""),
            },
            "head_commit": {
                "message": r.get("head_commit", {}).get("message", "").split("\n")[0] if r.get("head_commit") else "",
            },
        })

    return {"runs": runs, "total_count": data.get("total_count", 0)}


@router.get("/repos/{owner}/{repo}/runs/{run_id}/logs")
async def get_run_logs(owner: str, repo: str, run_id: int):
    """Fetch jobs and their logs for a specific workflow run."""
    async with httpx.AsyncClient(timeout=15.0) as client:
        # Get jobs for this run
        response = await client.get(
            f"https://api.github.com/repos/{owner}/{repo}/actions/runs/{run_id}/jobs",
            headers=_get_headers()
        )
        if response.status_code != 200:
            raise HTTPException(status_code=response.status_code, detail="Failed to fetch run jobs.")

        data = response.json()

    jobs = []
    for job in data.get("jobs", []):
        steps = []
        for step in job.get("steps", []):
            steps.append({
                "name": step.get("name", ""),
                "status": step.get("status", ""),
                "conclusion": step.get("conclusion", ""),
                "number": step.get("number", 0),
                "started_at": step.get("started_at", ""),
                "completed_at": step.get("completed_at", ""),
            })

        jobs.append({
            "id": job.get("id"),
            "name": job.get("name", ""),
            "status": job.get("status", ""),
            "conclusion": job.get("conclusion", ""),
            "started_at": job.get("started_at", ""),
            "completed_at": job.get("completed_at", ""),
            "steps": steps,
            "html_url": job.get("html_url", ""),
        })

    return {"jobs": jobs}


@router.get("/repos/{owner}/{repo}/contents/{path:path}")
async def get_file_contents(owner: str, repo: str, path: str):
    """Fetch file contents from the repository."""
    async with httpx.AsyncClient(timeout=15.0) as client:
        response = await client.get(
            f"https://api.github.com/repos/{owner}/{repo}/contents/{path}",
            headers=_get_headers()
        )
        if response.status_code != 200:
            raise HTTPException(status_code=response.status_code, detail=f"Failed to fetch file: {path}")

        data = response.json()

    import base64
    content = ""
    if data.get("encoding") == "base64" and data.get("content"):
        try:
            content = base64.b64decode(data["content"]).decode("utf-8", errors="replace")
        except Exception:
            content = "[Binary or undecodable file]"

    return {
        "name": data.get("name", ""),
        "path": data.get("path", ""),
        "size": data.get("size", 0),
        "content": content,
        "sha": data.get("sha", ""),
        "html_url": data.get("html_url", ""),
    }


@router.post("/repos/{owner}/{repo}/analyze")
async def analyze_repo(owner: str, repo: str):
    """
    Analyze a repo's CI/CD setup and predict pipeline health using Git Trees API for max speed.
    """
    import asyncio
    import re

    # Core AI logic is now handled by agent.py, so we skip local gemini setup

    context_parts = []
    
    async with httpx.AsyncClient(timeout=25.0) as client:
        headers = _get_headers()

        # 1. Fetch repo info
        resp = await client.get(f"https://api.github.com/repos/{owner}/{repo}", headers=headers)
        if resp.status_code == 200:
            repo_info = resp.json()
            context_parts.append(f"Repository: {repo_info.get('full_name')}")
            context_parts.append(f"Language: {repo_info.get('language', 'Unknown')}")
            branch = repo_info.get('default_branch', 'main')
            context_parts.append(f"Default Branch: {branch}")
        else:
            raise HTTPException(status_code=404, detail="Repo not found")

        # 2. Get Full Git Tree recursively (instantly gets all files)
        tree_resp = await client.get(f"https://api.github.com/repos/{owner}/{repo}/git/trees/{branch}?recursive=1", headers=headers)
        if tree_resp.status_code != 200:
            raise HTTPException(status_code=500, detail="Failed to fetch git tree structure")
        tree_data = tree_resp.json()
        all_paths = [t.get("path") for t in tree_data.get("tree", []) if t.get("type") == "blob"]

        # Filter for interesting configs (CI workflows, package, docker, requirements)
        # We max out at 15 files to keep analysis fast and strictly relevant
        ci_patterns = re.compile(r"(\.github/workflows/.*\.yml$|\.gitlab-ci\.yml$|Jenkinsfile$|\.circleci/config\.yml$|^package\.json$|^requirements\.txt$|^Dockerfile.*$|^docker-compose.*$|^pom\.xml$|^build\.gradle.*$|^Cargo\.toml$|^go\.mod$)")
        
        target_files = [p for p in all_paths if ci_patterns.match(p or "")]
        target_files = target_files[:5] # hard limit to avoid hitting rate limits context size
        
        async def fetch_file(path):
            file_resp = await client.get(f"https://api.github.com/repos/{owner}/{repo}/contents/{path}", headers=headers)
            if file_resp.status_code == 200:
                file_data = file_resp.json()
                import base64
                if file_data.get("encoding") == "base64" and file_data.get("content"):
                    try:
                        content = base64.b64decode(file_data["content"]).decode("utf-8", errors="replace")
                        return f"--- File: {path} ---\n{content[:2500]}"
                    except Exception:
                        pass
            return None

        # Fetch contents concurrently
        if target_files:
            file_results = await asyncio.gather(*[fetch_file(f) for f in target_files])
            fetched_files = [res for res in file_results if res]
            if fetched_files:
                context_parts.append("Important Repository Files (CI/CD, Configs, Dependencies):\n" + "\n\n".join(fetched_files))
                ci_config_found = any('.github' in path or 'ci' in path.lower() or 'jenkins' in path.lower() for path in target_files)
            else:
                context_parts.append("No readable CI/CD Configs or Dependency files found.")
                ci_config_found = False
        else:
            context_parts.append("No CI/CD Configs or Dependency files found in the repository tree.")
            ci_config_found = False

        # 3. Fetch recent commits
        resp = await client.get(
            f"https://api.github.com/repos/{owner}/{repo}/commits?per_page=5",
            headers=headers
        )
        if resp.status_code == 200:
            commits = resp.json()
            commit_msgs = [f"- {c.get('commit', {}).get('message', '').split(chr(10))[0]}" for c in commits]
            context_parts.append("Recent Commits:\n" + "\n".join(commit_msgs))

        # 4. Fetch recent workflow runs
        resp = await client.get(
            f"https://api.github.com/repos/{owner}/{repo}/actions/runs?per_page=10",
            headers=headers
        )
        recent_runs_summary = ""
        if resp.status_code == 200:
            runs_data = resp.json()
            runs_list = runs_data.get("workflow_runs", [])
            if runs_list:
                run_summaries = []
                for r in runs_list:
                    run_summaries.append(
                        f"- {r.get('name', 'N/A')}: {r.get('conclusion', r.get('status', 'unknown'))} "
                        f"(branch: {r.get('head_branch', '?')}, event: {r.get('event', '?')})"
                    )
                recent_runs_summary = "\n".join(run_summaries)
                context_parts.append("Recent CI/CD Runs:\n" + recent_runs_summary)

    # Build the AI prompt context
    full_context = "\n\n".join(context_parts)

    try:
        # Use the Agent to analyze the full repo context
        result = agent.analyze_repo_full(
            full_context=full_context,
            analyzed_files_count=len(target_files) if target_files else 0
        )
        
        # Override these since we dynamically tracked them
        result["ci_config_found"] = ci_config_found
        result["analyzed_files"] = len(target_files) if target_files else 0
        
        return {"prediction": result}

    except Exception as e:
        return {"prediction": {
            "failure_probability": 0.5,
            "risk_level": "medium",
            "likely_causes": [{"cause": "Analysis AI error response", "confidence": 0.5}],
            "summary": "AI Analysis failed to process the repository context.",
            "recommendations": ["Re-run analysis", str(e)],
            "ci_config_found": False,
            "analyzed_files": 0
        }}
