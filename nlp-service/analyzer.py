import re
import os

from rules import LIFE_SAVING_RULES, PRECURSOR_TERMS

_transformer = None
_transformer_ready = False


def load_transformer():
    global _transformer, _transformer_ready
    if _transformer_ready:
        return _transformer
    _transformer_ready = True
    try:
        from transformers import pipeline

        model_name = os.getenv("SIH_MODEL_NAME", "typeform/distilbert-base-uncased-mnli")
        allow_download = os.getenv("SIH_ALLOW_MODEL_DOWNLOAD", "false").lower() == "true"
        _transformer = pipeline(
            "zero-shot-classification",
            model=model_name,
            local_files_only=not allow_download,
        )
    except Exception:
        _transformer = None
    return _transformer


def analyze_text(text: str) -> dict:
    normalized = text.lower()
    matched_rules = [
        rule for rule in LIFE_SAVING_RULES
        if any(pattern in normalized for pattern in rule["patterns"])
    ]
    primary_rule = matched_rules[0] if matched_rules else None
    hazards = list(dict.fromkeys(
        [rule["name"] for rule in matched_rules]
        + (["Fall Protection"] if "harness" in normalized or "fall" in normalized or "lanyard" in normalized else [])
        + (["Unexpected Start-up"] if "start" in normalized or "energized" in normalized else [])
        + (["Dropped Objects"] if "drop" in normalized or "suspended load" in normalized else [])
    )) or ["General Workplace Safety"]
    precursor = bool(primary_rule and any(
        term in normalized for term in PRECURSOR_TERMS.get(primary_rule["name"], [])
    ))
    if primary_rule and not precursor and any(word in normalized for word in ("without", "failed", "bypass", "unsafe", "not ")):
        precursor = True

    if re.search(r"near miss|almost|came close|no contact|no injury|stopped before", normalized):
        classification = "Near Miss"
    elif re.search(r"injur|hospital|spill|collision|damaged|contact occurred", normalized):
        classification = "Incident"
    elif re.search(r"bypass|ignored|without permission|failed to|did not follow", normalized):
        classification = "Unsafe Act"
    else:
        classification = "Unsafe Condition"

    entities = list(dict.fromkeys(re.findall(
        r"\b(?:worker|operator|technician|pedestrian|forklift|crane|pump|vessel|scaffold|harness|welder|contractor|crew|platform|vehicle|tank|sling)\b",
        normalized,
    )))[:8]
    risk_level = "Critical" if precursor and primary_rule and primary_rule["name"] in ("Working at Height", "Energy Isolation", "Bypassing Safety Controls") else "High" if precursor else "Medium" if classification == "Incident" else "Low"
    confidence = 0.88 if precursor else 0.8 if primary_rule else 0.74
    provider = "Prototype NLP / Rule-based Analysis"
    explanation = (
        f"The report contains indicators associated with {primary_rule['name'].lower()} exposure. "
        "Verify this prototype assessment with a competent reviewer."
        if precursor and primary_rule else
        "No configured high-consequence precursor pattern was identified. Review the report and local controls before closing it."
    )

    model = load_transformer()
    if model:
        try:
            result = model(text[:1500], candidate_labels=["Unsafe Act", "Unsafe Condition", "Near Miss", "Incident"])
            if result["scores"][0] >= 0.7:
                classification = result["labels"][0]
                confidence = round(float(result["scores"][0]), 2)
                provider = "Hybrid: DistilBERT + prototype rules"
        except Exception:
            pass

    return {
        "classification": classification,
        "sif_precursor": precursor,
        "risk_level": risk_level,
        "confidence": round(confidence, 2),
        "hazards": hazards,
        "entities": entities,
        "life_saving_rule": primary_rule["name"] if primary_rule else None,
        "explanation": explanation,
        "provider": provider,
    }