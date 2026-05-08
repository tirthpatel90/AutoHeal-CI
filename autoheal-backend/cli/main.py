import argparse
import sys
import json
from rich.console import Console
from rich.panel import Panel

# Make sure we can import from the parent directory
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from core.agent import agent

console = Console()

def main():
    parser = argparse.ArgumentParser(description="AutoHeal CI Agent - Terminal Interface")
    parser.add_argument("command", choices=["predict", "heal"], help="The action to perform")
    parser.add_argument("--repo", help="Repository context (e.g. owner/repo)")
    parser.add_argument("--logs", help="Error logs to analyze")
    
    args = parser.parse_args()
    
    if args.command == "predict":
        if not args.repo:
            console.print("[red]Error: --repo is required for prediction[/red]")
            return
            
        console.print(f"[yellow]Analyzing repository {args.repo} for pipeline health...[/yellow]")
        result = agent.predict_health(repo_context=args.repo)
        
        console.print(Panel.fit(
            f"Risk Level: [bold {get_color(result.get('risk_level'))}]{result.get('risk_level', 'unknown').upper()}[/]\n"
            f"Failure Probability: {result.get('failure_probability', 0) * 100}%\n"
            f"Summary: {result.get('summary')}",
            title="Prediction Results"
        ))
        
    elif args.command == "heal":
        if not args.logs:
            console.print("[red]Error: --logs is required for healing[/red]")
            return
            
        console.print("[yellow]Analyzing error logs to find a fix...[/yellow]")
        result = agent.heal_error(error_logs=args.logs)
        
        console.print(Panel.fit(
            f"Predicted Cause:\n{result.get('predicted_cause', 'Unknown')}\n\n"
            f"Suggested Fix:\n[green]{result.get('suggested_fix', 'None')}[/green]",
            title="AutoHeal Fix"
        ))

def get_color(risk_level: str) -> str:
    mapping = {"low": "green", "medium": "yellow", "high": "red", "critical": "magenta"}
    return mapping.get(risk_level, "white")

if __name__ == "__main__":
    main()
