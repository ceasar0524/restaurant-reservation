const router = require('express').Router();
const db = require('../../db');
const { validate, updateStatusSchema } = require('../../middleware/validate');
const { createError } = require('../../middleware/errorHandler');
const ERRORS = require('../../constants/errors');
const notification = require('../../services/notification');

function nowISO() {
  return new Date().toISOString().replace('T', ' ').split('.')[0];
}

// GET /api/admin/reservations — 列出訂位（支援篩選與分頁）
router.get('/', (req, res) => {
  const { date, status, page = '1', limit = '20' } = req.query;
  const conditions = [];
  const params = [];

  if (date) { conditions.push('date = ?'); params.push(date); }
  if (status) { conditions.push('status = ?'); params.push(status); }

  const where = conditions.length ? 'WHERE ' + conditions.join(' AND ') : '';
  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
  const offset = (pageNum - 1) * limitNum;

  const rows = db
    .prepare(`SELECT * FROM reservations ${where} ORDER BY date, time_slot LIMIT ? OFFSET ?`)
    .all(...params, limitNum, offset);

  const total = db
    .prepare(`SELECT COUNT(*) as count FROM reservations ${where}`)
    .get(...params).count;

  return res.json({
    data: rows,
    pagination: { page: pageNum, limit: limitNum, total },
  });
});

// PATCH /api/admin/reservations/:id — 更新訂位狀態
router.patch('/:id', validate(updateStatusSchema), (req, res, next) => {
  const { status } = req.body;
  const ts = nowISO();

  const result = db
    .prepare('UPDATE reservations SET status = ?, updated_at = ? WHERE id = ?')
    .run(status, ts, req.params.id);

  if (result.changes === 0) {
    return next(createError(404, ERRORS.NOT_FOUND, '找不到此訂位'));
  }

  const updated = db.prepare('SELECT * FROM reservations WHERE id = ?').get(req.params.id);

  if (['confirmed', 'cancelled'].includes(status)) {
    notification.enqueue({
      type: 'status_updated',
      confirmation_code: updated.confirmation_code,
      status,
    });
  }

  return res.json(updated);
});

module.exports = router;
