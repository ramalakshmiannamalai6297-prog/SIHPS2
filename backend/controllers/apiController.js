const store = require('../models/store');
const { analyze } = require('../services/analyzer');

function summary() {
  const reports = store.getReports();
  const actions = store.getActions();
  const severity = ['Critical', 'High', 'Medium', 'Low'].map((name) => ({ name, value: reports.filter((report) => report.analysis.risk_level === name).length }));
  const hazards = [...reports.reduce((map, report) => map.set(report.category, (map.get(report.category) || 0) + 1), new Map())].map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value).slice(0, 7);
  const days = Array.from({ length: 7 }, (_, index) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - index));
    const key = date.toISOString().slice(0, 10);
    return { date: key, label: date.toLocaleDateString('en', { weekday: 'short' }), reports: reports.filter((report) => report.date === key).length, precursors: reports.filter((report) => report.date === key && report.analysis.sif_precursor).length };
  });
  return { totalReports: reports.length, highRisk: reports.filter((report) => ['High', 'Critical'].includes(report.analysis.risk_level)).length, sifPrecursors: reports.filter((report) => report.analysis.sif_precursor).length, openActions: actions.filter((action) => action.status !== 'Completed').length, severity, hazards, trends: days, actionStatus: ['Open', 'In Progress', 'Completed'].map((name) => ({ name, value: actions.filter((action) => action.status === name).length })), ruleFrequency: [...reports.reduce((map, report) => { const rule = report.analysis.life_saving_rule; if (rule) map.set(rule, (map.get(rule) || 0) + 1); return map; }, new Map())].map(([name, value]) => ({ name, value })), alerts: buildAlerts(reports, actions) };
}

function buildAlerts(reports, actions) {
  const alerts = [];
  const latestCritical = reports.find((report) => report.analysis.risk_level === 'Critical');
  if (latestCritical) alerts.push({ type: 'critical', title: 'High SIF precursor detected', detail: `${latestCritical.title} · ${latestCritical.location}` });
  const counts = reports.reduce((map, report) => map.set(report.category, (map.get(report.category) || 0) + 1), new Map());
  const repeated = [...counts].find(([, count]) => count > 1);
  if (repeated) alerts.push({ type: 'pattern', title: 'Repeated hazard pattern', detail: `${repeated[0]} appears in ${repeated[1]} reports` });
  const overdue = actions.find((action) => action.status !== 'Completed' && action.dueDate < new Date().toISOString().slice(0, 10));
  if (overdue) alerts.push({ type: 'overdue', title: 'Corrective action overdue', detail: overdue.action });
  return alerts;
}

async function login(req, res) {
  const { email, password } = req.body || {};
  if (!email || !password) return res.status(400).json({ error: 'Email and password are required.' });
  if (email.toLowerCase() !== 'demo@sih26165.in' || password !== 'SafetyDemo26165!') return res.status(401).json({ error: 'Those demo credentials were not recognized.' });
  const jwt = require('jsonwebtoken');
  const token = jwt.sign({ name: 'Safety Analyst', email: 'demo@sih26165.in', role: 'HSE Analyst' }, process.env.JWT_SECRET || 'local-demo-secret-change-me', { expiresIn: '8h' });
  return res.json({ token, user: { name: 'Safety Analyst', email: 'demo@sih26165.in', role: 'HSE Analyst' } });
}

function getReports(req, res) {
  const query = String(req.query.search || '').toLowerCase();
  const risk = String(req.query.risk || 'All');
  const reports = store.getReports().filter((report) => {
    const matchesQuery = !query || [report.id, report.title, report.location, report.category].some((value) => value.toLowerCase().includes(query));
    return matchesQuery && (risk === 'All' || report.analysis.risk_level === risk);
  });
  return res.json(reports);
}

function getReport(req, res) {
  const report = store.getReport(req.params.id);
  return report ? res.json(report) : res.status(404).json({ error: 'Report not found.' });
}

async function createReport(req, res) {
  const { title, description, location, activity, date, reporterType, category } = req.body || {};
  if (![title, description, location, activity, date, reporterType, category].every((value) => typeof value === 'string' && value.trim())) return res.status(400).json({ error: 'Complete every report field before submitting.' });
  if (description.length > 5000) return res.status(400).json({ error: 'Report descriptions must be 5,000 characters or fewer.' });
  const report = { id: store.nextReportId(), title: title.trim(), description: description.trim(), location: location.trim(), activity: activity.trim(), date, reporterType, category, status: 'Under Review', analysis: await analyze(description) };
  await store.addReport(report);
  return res.status(201).json(report);
}

async function analyzeReport(req, res) {
  const report = store.getReport(req.params.id);
  if (!report) return res.status(404).json({ error: 'Report not found.' });
  const analysis = await analyze(report.description);
  return res.json(await store.updateAnalysis(report.id, analysis));
}

async function analyzeDraft(req, res) {
  const { text } = req.body || {};
  if (typeof text !== 'string' || text.trim().length < 5 || text.length > 5000) return res.status(400).json({ error: 'Enter a report description between 5 and 5,000 characters.' });
  return res.json(await analyze(text.trim()));
}

function getActions(req, res) { return res.json(store.getActions()); }

async function updateAction(req, res) {
  const { status, owner, dueDate } = req.body || {};
  if (status && !['Open', 'In Progress', 'Completed'].includes(status)) return res.status(400).json({ error: 'Status must be Open, In Progress, or Completed.' });
  const action = await store.updateAction(req.params.id, { status, owner, dueDate });
  return action ? res.json(action) : res.status(404).json({ error: 'Corrective action not found.' });
}

module.exports = { login, getReports, getReport, createReport, analyzeReport, analyzeDraft, getActions, updateAction, getDashboard: (req, res) => res.json(summary()), getAnalytics: (req, res) => res.json(summary()) };