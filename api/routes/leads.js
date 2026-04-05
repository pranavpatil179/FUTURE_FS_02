const express = require('express');
const router = express.Router();
const db = require('../db');
const authMiddleware = require('../middleware/auth');

// All routes require auth
router.use(authMiddleware);

// GET /api/leads — list all leads with optional search & filter
router.get('/', (req, res) => {
  const { search = '', status = '', source = '' } = req.query;

  let query = `
    SELECT l.*, 
      (SELECT COUNT(*) FROM notes n WHERE n.lead_id = l.id) as notes_count
    FROM leads l
    WHERE 1=1
  `;
  const params = [];

  if (search) {
    query += ` AND (l.name LIKE ? OR l.email LIKE ? OR l.company LIKE ?)`;
    params.push(`%${search}%`, `%${search}%`, `%${search}%`);
  }

  if (status) {
    query += ` AND l.status = ?`;
    params.push(status);
  }

  if (source) {
    query += ` AND l.source = ?`;
    params.push(source);
  }

  query += ` ORDER BY l.created_at DESC`;

  const leads = db.prepare(query).all(...params);
  res.json({ leads });
});

// GET /api/leads/stats — analytics summary
router.get('/stats', (req, res) => {
  const total = db.prepare('SELECT COUNT(*) as count FROM leads').get().count;
  const newLeads = db.prepare("SELECT COUNT(*) as count FROM leads WHERE status='new'").get().count;
  const contacted = db.prepare("SELECT COUNT(*) as count FROM leads WHERE status='contacted'").get().count;
  const converted = db.prepare("SELECT COUNT(*) as count FROM leads WHERE status='converted'").get().count;

  const conversionRate = total > 0 ? Math.round((converted / total) * 100) : 0;

  // Leads by source
  const bySource = db.prepare(`
    SELECT source, COUNT(*) as count FROM leads GROUP BY source
  `).all();

  // Leads over last 7 days
  const trend = db.prepare(`
    SELECT DATE(created_at) as date, COUNT(*) as count
    FROM leads
    WHERE created_at >= datetime('now', '-7 days')
    GROUP BY DATE(created_at)
    ORDER BY date ASC
  `).all();

  res.json({ total, newLeads, contacted, converted, conversionRate, bySource, trend });
});

// GET /api/leads/:id — single lead with notes
router.get('/:id', (req, res) => {
  const lead = db.prepare('SELECT * FROM leads WHERE id = ?').get(req.params.id);
  if (!lead) return res.status(404).json({ error: 'Lead not found' });

  const notes = db.prepare('SELECT * FROM notes WHERE lead_id = ? ORDER BY created_at DESC').all(req.params.id);
  res.json({ lead, notes });
});

// POST /api/leads — create new lead
router.post('/', (req, res) => {
  const { name, email, phone, company, source } = req.body;

  if (!name || !email) {
    return res.status(400).json({ error: 'Name and email are required' });
  }

  const result = db.prepare(`
    INSERT INTO leads (name, email, phone, company, source, status)
    VALUES (?, ?, ?, ?, ?, 'new')
  `).run(name, email, phone || null, company || null, source || 'website');

  const lead = db.prepare('SELECT * FROM leads WHERE id = ?').get(result.lastInsertRowid);
  res.status(201).json({ lead });
});

// PUT /api/leads/:id — update lead (status, details)
router.put('/:id', (req, res) => {
  const { name, email, phone, company, source, status } = req.body;
  const validStatuses = ['new', 'contacted', 'converted'];

  if (status && !validStatuses.includes(status)) {
    return res.status(400).json({ error: 'Invalid status' });
  }

  db.prepare(`
    UPDATE leads
    SET name = COALESCE(?, name),
        email = COALESCE(?, email),
        phone = COALESCE(?, phone),
        company = COALESCE(?, company),
        source = COALESCE(?, source),
        status = COALESCE(?, status),
        updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `).run(name, email, phone, company, source, status, req.params.id);

  const lead = db.prepare('SELECT * FROM leads WHERE id = ?').get(req.params.id);
  if (!lead) return res.status(404).json({ error: 'Lead not found' });

  res.json({ lead });
});

// POST /api/leads/:id/notes — add note to lead
router.post('/:id/notes', (req, res) => {
  const { text } = req.body;
  if (!text || !text.trim()) {
    return res.status(400).json({ error: 'Note text is required' });
  }

  const lead = db.prepare('SELECT id FROM leads WHERE id = ?').get(req.params.id);
  if (!lead) return res.status(404).json({ error: 'Lead not found' });

  const result = db.prepare('INSERT INTO notes (lead_id, text) VALUES (?, ?)').run(req.params.id, text.trim());
  const note = db.prepare('SELECT * FROM notes WHERE id = ?').get(result.lastInsertRowid);

  res.status(201).json({ note });
});

// DELETE /api/leads/:id/notes/:noteId — delete a note
router.delete('/:id/notes/:noteId', (req, res) => {
  db.prepare('DELETE FROM notes WHERE id = ? AND lead_id = ?').run(req.params.noteId, req.params.id);
  res.json({ message: 'Note deleted' });
});

// DELETE /api/leads/:id — delete lead
router.delete('/:id', (req, res) => {
  db.prepare('DELETE FROM leads WHERE id = ?').run(req.params.id);
  res.json({ message: 'Lead deleted' });
});

module.exports = router;
