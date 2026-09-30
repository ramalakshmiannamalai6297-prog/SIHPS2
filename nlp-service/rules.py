LIFE_SAVING_RULES = [
    {"name": "Line of Fire", "patterns": ["line of fire", "suspended load", "drop zone", "struck by", "caught between", "pinch point"]},
    {"name": "Energy Isolation", "patterns": ["isolation", "lockout", "lock-out", "tagout", "tag-out", "energized", "unexpected start", "zero energy"]},
    {"name": "Working at Height", "patterns": ["height", "elevated", "scaffold", "platform", "roof", "ladder", "fall-arrest", "harness", "lanyard", "guardrail"]},
    {"name": "Confined Space", "patterns": ["confined space", "vessel", "tank entry", "gas test", "atmosphere"]},
    {"name": "Driving", "patterns": ["vehicle", "forklift", "reversing", "pedestrian", "driving", "mobile equipment"]},
    {"name": "Lifting Operations", "patterns": ["lifting", "hoist", "rigging", "sling", "crane", "load shifted"]},
    {"name": "Hot Work", "patterns": ["hot work", "weld", "welding", "spark", "fire watch"]},
    {"name": "Bypassing Safety Controls", "patterns": ["bypass", "interlock", "guard removed", "safety control", "defeat"]},
]

PRECURSOR_TERMS = {
    "Working at Height": ["without fall", "no harness", "unprotected", "lanyard", "without guardrail"],
    "Energy Isolation": ["not isolated", "not verified", "without isolation", "energized", "unexpected start"],
    "Line of Fire": ["beneath a suspended", "drop zone", "line of fire", "caught between"],
    "Confined Space": ["without gas test", "without atmosphere", "without permit", "confined space entry"],
    "Driving": ["pedestrian", "reversing", "vehicle and", "forklift"],
    "Lifting Operations": ["load shifted", "sling moved", "suspended load", "unsafe lift"],
    "Hot Work": ["sparks", "fire watch", "hot work", "fire-resistant screen"],
    "Bypassing Safety Controls": ["bypassed", "bypass", "interlock", "guard removed"],
}