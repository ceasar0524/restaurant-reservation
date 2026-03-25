const router = require('express').Router();
const reservationRepo = require('../../db/repositories/reservationRepository');
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
  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
  const offset = (pageNum - 1) * limitNum;

  const rows = reservationRepo.findAll({ date, status }, { limitNum, offset });
  const total = reservationRepo.countAll({ date, status });

  return res.json({
    data: rows,
    pagination: { page: pageNum, limit: limitNum, total },
  });
});

// PATCH /api/admin/reservations/:id — 更新訂位狀態或備註
router.patch('/:id', validate(updateStatusSchema), (req, res, next) => {
  const { status, admin_notes } = req.body;
  const ts = nowISO();

  const result = reservationRepo.updateById(req.params.id, { status, admin_notes }, ts);

  if (result.changes === 0) {
    return next(createError(404, ERRORS.NOT_FOUND, '找不到此訂位'));
  }

  const updated = reservationRepo.findById(req.params.id);

  if (status && ['confirmed', 'cancelled'].includes(status)) {
    notification.enqueue({
      type: 'status_updated',
      confirmation_code: updated.confirmation_code,
      status,
    });
  }

  return res.json(updated);
});

module.exports = router;
