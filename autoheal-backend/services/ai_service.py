import google.generativeai as genai
from config import settings
import json

class AIService:
    def __init__(self):
        if not settings.gemini_api_key:
            raise ValueError("Gemini API Key is not configured.")
        genai.configure(api_key=settings.gemini_api_key)
        # Using Gemini 2.0 Flash as in existing codebase
        self.model = genai.GenerativeModel("models/gemini-2.0-flash")

    def analyze_error(self, prompt: str) -> str:
        """Sends a prompt to Gemini and returns the raw text response."""
        response = self.model.generate_content(prompt)
        text = response.text.strip()
        return self._clean_json_markdown(text)

    def predict_pipeline(self, prompt: str) -> dict:
        """Sends a prediction prompt and returns parsed JSON."""
        response = self.model.generate_content(prompt)
        text = response.text.strip()
        cleaned_text = self._clean_json_markdown(text)
        return json.loads(cleaned_text)
        
    def _clean_json_markdown(self, text: str) -> str:
        """Removes markdown backticks from JSON responses."""
        if text.startswith("```json"):
            text = text[7:]
        if text.startswith("```"):
            text = text[3:]
        if text.endswith("```"):
            text = text[:-3]
        return text.strip()

# Singleton instance
ai_service = AIService()
