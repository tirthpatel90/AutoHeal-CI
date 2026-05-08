from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import json

# Import the new Agent
from core.agent import agent

router = APIRouter()

class ErrorReport(BaseModel):
    error_logs: str
    code_context: str | None = None

class PredictRequest(BaseModel):
    repo_context: str
    ci_config: str | None = None
    recent_logs: str | None = None

@router.post("/analyze")
async def analyze_error(report: ErrorReport):
    """
    Takes a build error and code context and asks Gemini to find a fix.
    """
    try:
        # The agent returns a dictionary. The original API returned a JSON string inside the 'result' key.
        # We maintain the exact API contract here.
        fix_dict = agent.heal_error(
            error_logs=report.error_logs,
            code_context=report.code_context
        )
        return {"result": json.dumps(fix_dict)}
    except ValueError as e:
        # Handle configuration errors (e.g. missing API key)
        raise HTTPException(status_code=500, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/predict")
async def predict_pipeline(request: PredictRequest):
    """
    Predict pipeline success/failure based on repo context, CI config, and recent logs.
    Returns structured prediction with failure probability and detailed reasons.
    """
    try:
        prediction = agent.predict_health(
            repo_context=request.repo_context,
            ci_config=request.ci_config,
            recent_logs=request.recent_logs
        )
        return {"prediction": prediction}
    except ValueError as e:
        raise HTTPException(status_code=500, detail=str(e))
    except Exception as e:
        # Fallback is handled by the agent, but catch catastrophic failures just in case
        return {"prediction": {
            "failure_probability": 0.5,
            "risk_level": "medium",
            "likely_causes": [{"cause": f"System error: {str(e)}", "confidence": 0.3}],
            "summary": "Could not complete analysis",
            "recommendations": ["Check backend logs."],
            "detailed_errors": []
        }}
