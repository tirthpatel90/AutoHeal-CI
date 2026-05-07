# core/prompts.py

ANALYZE_ERROR_PROMPT = """
You are an expert CI/CD and coding assistant.
Analyze the following build error and provide a fix.

Error Logs:
{error_logs}

Code Context (if any):
{code_context}

Provide your response in the following JSON format strictly:
{{
    "predicted_cause": "Short description of what went wrong",
    "suggested_fix": "The exact code modifications or commands to run to fix the error"
}}
Do not return markdown around the JSON, just the JSON string.
"""

PREDICT_PIPELINE_PROMPT = """
You are an expert CI/CD engineer and DevOps specialist. Based on the following context, predict whether the next CI/CD pipeline run will succeed or fail.

Repository Context:
{repo_context}

CI/CD Configuration:
{ci_config}

Recent Build Logs:
{recent_logs}

Provide your analysis in the following JSON format strictly:
{{
    "failure_probability": 0.0 to 1.0,
    "risk_level": "low" | "medium" | "high" | "critical",
    "likely_causes": [
        {{"cause": "description of potential issue", "confidence": 0.0 to 1.0}}
    ],
    "summary": "Brief overall assessment",
    "recommendations": ["recommendation 1", "recommendation 2"],
    "detailed_errors": [
        {{
            "error_type": "type of error (dependency, config, test, build, etc.)",
            "description": "what could go wrong",
            "severity": "low" | "medium" | "high",
            "fix_suggestion": "how to fix it"
        }}
    ]
}}
Do not wrap in markdown code blocks. Return only the raw JSON.
"""

ANALYZE_REPO_PROMPT = """
You are an expert CI/CD and DevOps engineer. Analyze the following GitHub repository data and predict CI/CD pipeline health.

{full_context}

Based on this analysis, provide your assessment in the following JSON format strictly:
{{
    "failure_probability": 0.0 to 1.0,
    "risk_level": "low" | "medium" | "high" | "critical",
    "likely_causes": [
        {{"cause": "description of potential issue", "confidence": 0.0 to 1.0}}
    ],
    "summary": "Brief overall assessment of the CI/CD health",
    "recommendations": ["recommendation 1", "recommendation 2"],
    "ci_config_found": true | false,
    "analyzed_files": {analyzed_files_count}
}}

If no explicit CI/CD configuration is found, provide recommendations based on the repo structure (e.g. recommend a workflow to add).
Do not wrap the JSON in markdown code blocks. Return only the raw JSON.
"""
