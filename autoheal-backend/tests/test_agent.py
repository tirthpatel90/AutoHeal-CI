import pytest
from core.agent import agent

def test_predict_health_fallback():
    """
    Test that the agent falls back securely if the AI service fails
    (e.g., if we pass garbage data or an unconfigured API key).
    """
    # Since we are not actually mocking the AI service here, 
    # we just want to ensure it doesn't crash entirely and returns a dict.
    response = agent.predict_health(
        repo_context="test_repo",
        ci_config="test_config",
        recent_logs="test_logs"
    )
    
    assert isinstance(response, dict)
    assert "failure_probability" in response
    assert "risk_level" in response

def test_analyze_repo_full_fallback():
    """
    Test the full repo analysis fallback behavior.
    """
    response = agent.analyze_repo_full(
        full_context="Testing full context",
        analyzed_files_count=1
    )
    
    assert isinstance(response, dict)
    assert "summary" in response
    assert "likely_causes" in response
