from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from analyzer import analyze_text

app = FastAPI(title="SIH 26165 Safety Report Analyzer", version="1.0.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)


class AnalyzeRequest(BaseModel):
    text: str = Field(min_length=5, max_length=5000)


@app.get("/health")
def health():
    return {"status": "ok", "mode": "hybrid prototype; rule-based fallback available"}


@app.post("/analyze")
def analyze(request: AnalyzeRequest):
    try:
        return analyze_text(request.text)
    except Exception as error:
        raise HTTPException(status_code=500, detail="The report could not be analyzed.") from error