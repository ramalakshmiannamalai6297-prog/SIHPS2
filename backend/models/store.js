const fs = require('node:fs/promises');
const path = require('node:path');
const { reports: seedReports, actions: seedActions } = require('./seedData');
const database = require('../config/database');

const storePath = path.join(__dirname, '..', 'data', 'demo-store.json');
let state = { reports: structuredClone(seedReports), actions: structuredClone(seedActions) };

async function initialize() {
  const databaseState = await database.initialize(seedReports, seedActions);
  if (databaseState) {
    state = databaseState;
    return;
  }
  try {
    state = JSON.parse(await fs.readFile(storePath, 'utf8'));
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
    await persist();
  }
}

async function persist() {
  await fs.mkdir(path.dirname(storePath), { recursive: true });
  await fs.writeFile(storePath, JSON.stringify(state, null, 2));
}

function getReports() {
  return [...state.reports].sort((a, b) => b.date.localeCompare(a.date));
}

function getReport(id) {
  return state.reports.find((report) => report.id === id) || null;
}

async function addReport(report) {
  await database.saveReport(report);
  state.reports.unshift(report);
  await persist();
  return report;
}

async function updateAnalysis(id, analysis) {
  const report = getReport(id);
  if (!report) return null;
  report.analysis = analysis;
  report.category = report.category || analysis.hazards[0] || 'Other';
  if (analysis.sif_precursor && report.status === 'Under Review') report.status = 'Action Required';
  await database.saveAnalysis(report);
  await persist();
  return report;
}

function getActions() {
  return state.actions.map((action) => ({ ...action, reportTitle: getReport(action.reportId)?.title || 'Report unavailable' }));
}

async function updateAction(id, updates) {
  const action = state.actions.find((item) => item.id === id);
  if (!action) return null;
  if (updates.status) action.status = updates.status;
  if (updates.owner) action.owner = updates.owner;
  if (updates.dueDate) action.dueDate = updates.dueDate;
  await database.saveAction(action);
  await persist();
  return { ...action, reportTitle: getReport(action.reportId)?.title || 'Report unavailable' };
}

function nextReportId() {
  const suffix = String(Date.now()).slice(-6);
  return `RPT-${suffix}`;
}

module.exports = { initialize, getReports, getReport, addReport, updateAnalysis, getActions, updateAction, nextReportId };