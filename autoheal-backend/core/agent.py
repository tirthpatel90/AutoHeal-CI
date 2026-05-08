from services.ai_service import ai_service
from core.prompts import ANALYZE_ERROR_PROMPT, PREDICT_PIPELINE_PROMPT, ANALYZE_REPO_PROMPT
import json

class AutoHealAgent:
    """
    The main orchestrator for AutoHeal CI.
    Combines GitHub data and AI reasoning to predict and fix CI/CD failures.
    """
    
    def heal_error(self, error_logs: str, code_context: str = None) -> dict:
        """Analyzes a specific error and suggests a fix."""
        prompt = ANALYZE_ERROR_PROMPT.format(
            error_logs=error_logs,
            code_context=code_context or "None provided"
        )
        response_text = ai_service.analyze_error(prompt)
        try:
            return json.loads(response_text)
        except json.JSONDecodeError:
            return {
                "predicted_cause": "AI failed to format response as JSON.",
                "suggested_fix": response_text
            }

    def predict_health(self, repo_context: str, ci_config: str = None, recent_logs: str = None) -> dict:
        """Predicts pipeline failure probability based on context."""
        prompt = PREDICT_PIPELINE_PROMPT.format(
            repo_context=repo_context,
            ci_config=ci_config or "Not provided",
            recent_logs=recent_logs or "Not provided"
        )
        try:
            return ai_service.predict_pipeline(prompt)
        except Exception as e:
            return self._fallback_prediction(str(e))

    def analyze_repo_full(self, full_context: str, analyzed_files_count: int) -> dict:
        """Analyzes the full repository structure for CI health."""
        prompt = ANALYZE_REPO_PROMPT.format(
            full_context=full_context,
            analyzed_files_count=analyzed_files_count
        )
        try:
            return ai_service.predict_pipeline(prompt)
        except Exception as e:
            return self._fallback_prediction(str(e))
            
    def _fallback_prediction(self, error_message: str) -> dict:
        return {
            "failure_probability": 0.5,
            "risk_level": "medium",
            "likely_causes": [{"cause": f"Analysis error: {error_message}", "confidence": 0.3}],
            "summary": "Could not complete AI analysis.",
            "recommendations": ["Check API keys and rate limits."],
            "detailed_errors": []
        }

# Singleton agent instance
agent = AutoHealAgent()
