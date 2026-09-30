const rules = [
  { name: 'Working at Height', patterns: [/height|elevated|scaffold|platform|roof|ladder/i, /fall.?arrest|harness|lanyard|guardrail/i], hazards: ['Working at Height', 'Fall Protection'], risk: 'Critical' },
  { name: 'Energy Isolation', patterns: [/isolation|lock.?out|tag.?out|energized|unexpected start|zero energy/i], hazards: ['Energy Isolation', 'Unexpected Start-up'], risk: 'Critical' },
  { name: 'Line of Fire', patterns: [/line of fire|suspended load|drop zone|struck by|caught between|pinch point/i], hazards: ['Line of Fire'], risk: 'High' },
  { name: 'Confined Space', patterns: [/confined space|vessel|tank entry|gas test|atmosphere/i], hazards: ['Confined Space', 'Atmospheric Hazard'], risk: 'High' },
  { name: 'Driving', patterns: [/vehicle|forklift|reversing|pedestrian|driving|mobile equipment/i], hazards: ['Vehicle Movement', 'Line of Fire'], risk: 'High' },
  { name: 'Lifting Operations', patterns: [/lifting|hoist|rigging|sling|crane|load shifted/i], hazards: ['Lifting Operations', 'Dropped Objects'], risk: 'High' },
  { name: 'Hot Work', patterns: [/hot work|weld|welding|spark|fire watch/i], hazards: ['Hot Work', 'Fire'], risk: 'Medium' },
  { name: 'Bypassing Safety Controls', patterns: [/bypass|interlock|guard removed|safety control|defeat.*control/i], hazards: ['Safety Control Bypass'], risk: 'Critical' }
];

function analyzeLocally(text) {
  const matches = rules.filter((rule) => rule.patterns.some((pattern) => pattern.test(text)));
  const match = matches[0];
  const nearMiss = /near miss|almost|came close|no contact|no injury|stopped before/i.test(text);
  const incident = /injur|hospital|spill|collision|damaged|contact occurred/i.test(text);
  const unsafeAct = /bypass|ignored|without permission|failed to|did not follow/i.test(text);
  const classification = nearMiss ? 'Near Miss' : incident ? 'Incident' : unsafeAct ? 'Unsafe Act' : 'Unsafe Condition';
  const entities = [...new Set((text.match(/\b(worker|operator|technician|pedestrian|forklift|crane|pump|vessel|scaffold|harness|welder|contractor|crew|platform|vehicle)\b/gi) || []).map((item) => item.toLowerCase()))].slice(0, 6);
  return {
    classification,
    sif_precursor: Boolean(match),
    risk_level: match?.risk || (classification === 'Incident' ? 'Medium' : 'Low'),
    confidence: match ? 0.84 + (matches.length > 1 ? 0.08 : 0.04) : 0.76,
    hazards: match ? [...new Set(matches.flatMap((item) => item.hazards))] : (classification === 'Near Miss' ? ['General Safety'] : ['General Workplace Safety']),
    entities,
    life_saving_rule: match?.name || null,
    explanation: match ? `The report contains indicators associated with ${match.name.toLowerCase()} exposure. Verify this prototype assessment with a competent reviewer.` : 'No configured high-consequence precursor pattern was identified. Review the report and local controls before closing it.',
    provider: 'Prototype NLP / Rule-based Analysis'
  };
}

async function analyze(text) {
  const serviceUrl = process.env.NLP_SERVICE_URL || 'http://127.0.0.1:8000';
  try {
    const response = await fetch(`${serviceUrl}/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
      signal: AbortSignal.timeout(4000)
    });
    if (!response.ok) throw new Error(`NLP service returned ${response.status}`);
    return await response.json();
  } catch {
    return analyzeLocally(text);
  }
}

module.exports = { analyze, analyzeLocally };