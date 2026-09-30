require('dotenv').config({ path: require('node:path').resolve(__dirname, '../.env') });
const express = require('express');
const cors = require('cors');
const store = require('./models/store');
const apiRoutes = require('./routes/apiRoutes');

const app = express();
const port = Number(process.env.PORT || 4000);
app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:5173' }));
app.use(express.json({ limit: '1mb' }));
app.get('/api/health', (req, res) => res.json({ status: 'ok', mode: 'Synthetic Demo Data', nlp: process.env.NLP_SERVICE_URL || 'http://127.0.0.1:8000' }));
app.use('/api', apiRoutes);
app.use((error, req, res, next) => {
  console.error(error);
  res.status(500).json({ error: 'The request could not be completed. Please try again.' });
});

store.initialize().then(() => app.listen(port, '0.0.0.0', () => console.log(`SIH 26165 API listening at http://localhost:${port}`))).catch((error) => {
  console.error('Could not initialize demo data:', error);
  process.exitCode = 1;
});