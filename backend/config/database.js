const fs = require('node:fs/promises');
const path = require('node:path');
const bcrypt = require('bcryptjs');
const { Pool } = require('pg');

let pool;

async function initialize(seedReports, seedActions) {
  if (!process.env.DATABASE_URL) return null;
  const candidate = new Pool({ connectionString: process.env.DATABASE_URL, connectionTimeoutMillis: 2500, ssl: process.env.PGSSL === 'true' ? { rejectUnauthorized: false } : undefined });
  try {
    await candidate.query('SELECT 1');
    const schema = await fs.readFile(path.resolve(__dirname, '../../database/schema.sql'), 'utf8');
    await candidate.query(schema);
    pool = candidate;
    await seedDatabase(seedReports, seedActions);
    const { rows: reportRows } = await pool.query('SELECT r.*, p.analysis FROM reports r LEFT JOIN predictions p ON p.report_id = r.id ORDER BY r.report_date DESC, r.id DESC');
    const { rows: actionRows } = await pool.query('SELECT * FROM corrective_actions ORDER BY due_date ASC');
    return {
      reports: reportRows.map((row) => ({ id: row.id, title: row.title, description: row.description, location: row.location, activity: row.activity, date: String(row.report_date).slice(0, 10), reporterType: row.reporter_type, category: row.category, status: row.status, analysis: row.analysis || { classification: 'Unsafe Condition', sif_precursor: false, risk_level: 'Low', confidence: 0.5, hazards: [], entities: [], life_saving_rule: null, explanation: 'This report has not been analyzed yet.', provider: 'Prototype NLP / Rule-based Analysis' } })),
      actions: actionRows.map((row) => ({ id: row.id, reportId: row.report_id, action: row.action, owner: row.owner, dueDate: String(row.due_date).slice(0, 10), priority: row.priority, status: row.status }))
    };
  } catch (error) {
    console.warn(`PostgreSQL unavailable; using local synthetic JSON data (${error.message}).`);
    await candidate.end().catch(() => {});
    pool = undefined;
    return null;
  }
}

async function seedDatabase(reports, actions) {
  const rules = ['Line of Fire', 'Energy Isolation', 'Working at Height', 'Confined Space', 'Driving', 'Lifting Operations', 'Hot Work', 'Bypassing Safety Controls'];
  for (const name of rules) await pool.query('INSERT INTO life_saving_rules (name, description) VALUES ($1, $2) ON CONFLICT (name) DO NOTHING', [name, `Prototype life-saving rule: ${name}`]);
  const passwordHash = await bcrypt.hash('SafetyDemo26165!', 10);
  await pool.query('INSERT INTO users (email, password_hash, name, role) VALUES ($1, $2, $3, $4) ON CONFLICT (email) DO NOTHING', ['demo@sih26165.in', passwordHash, 'Safety Analyst', 'HSE Analyst']);
  const { rows } = await pool.query('SELECT COUNT(*)::int AS count FROM reports');
  if (rows[0].count > 0) return;
  for (const report of reports) {
    await pool.query('INSERT INTO reports (id, title, description, location, activity, report_date, reporter_type, category, status) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)', [report.id, report.title, report.description, report.location, report.activity, report.date, report.reporterType, report.category, report.status]);
    await pool.query('INSERT INTO predictions (report_id, analysis) VALUES ($1, $2)', [report.id, report.analysis]);
  }
  for (const action of actions) await pool.query('INSERT INTO corrective_actions (id, report_id, action, owner, due_date, priority, status) VALUES ($1,$2,$3,$4,$5,$6,$7)', [action.id, action.reportId, action.action, action.owner, action.dueDate, action.priority, action.status]);
}

async function saveReport(report) {
  if (!pool) return;
  await pool.query('INSERT INTO reports (id, title, description, location, activity, report_date, reporter_type, category, status) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)', [report.id, report.title, report.description, report.location, report.activity, report.date, report.reporterType, report.category, report.status]);
  await pool.query('INSERT INTO predictions (report_id, analysis) VALUES ($1,$2)', [report.id, report.analysis]);
}

async function saveAnalysis(report) {
  if (!pool) return;
  await pool.query('INSERT INTO predictions (report_id, analysis) VALUES ($1,$2) ON CONFLICT (report_id) DO UPDATE SET analysis = EXCLUDED.analysis, analyzed_at = NOW()', [report.id, report.analysis]);
  await pool.query('UPDATE reports SET status = $2, category = $3 WHERE id = $1', [report.id, report.status, report.category]);
}

async function saveAction(action) {
  if (!pool) return;
  await pool.query('UPDATE corrective_actions SET status = $2, owner = $3, due_date = $4, updated_at = NOW() WHERE id = $1', [action.id, action.status, action.owner, action.dueDate]);
}

module.exports = { initialize, saveReport, saveAnalysis, saveAction };