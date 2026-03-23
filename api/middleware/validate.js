const Joi = require('joi');
const { createError } = require('./errorHandler');
const ERRORS = require('../constants/errors');

const TIME_SLOTS = [
  '午餐 11:30', '午餐 12:00', '午餐 12:30', '午餐 13:00', '午餐 13:30',
  '晚餐 17:30', '晚餐 18:00', '晚餐 18:30', '晚餐 19:00', '晚餐 19:30',
  '晚餐 20:00', '晚餐 20:30',
];

const createReservationSchema = Joi.object({
  customer_name: Joi.string().trim().min(1).required(),
  customer_email: Joi.string().email().required(),
  customer_phone: Joi.string().trim().min(1).required(),
  date: Joi.string().pattern(/^\d{4}-\d{2}-\d{2}$/).required(),
  time_slot: Joi.string().valid(...TIME_SLOTS).required(),
  party_size: Joi.number().integer().min(1).max(8).required(),
  special_requests: Joi.string().allow('', null).optional(),
});

const modifyReservationSchema = Joi.object({
  date: Joi.string().pattern(/^\d{4}-\d{2}-\d{2}$/).optional(),
  time_slot: Joi.string().valid(...TIME_SLOTS).optional(),
  party_size: Joi.number().integer().min(1).max(8).optional(),
}).min(1);

const updateStatusSchema = Joi.object({
  status: Joi.string()
    .valid('pending', 'confirmed', 'cancelled', 'completed', 'no_show')
    .optional(),
  admin_notes: Joi.string().allow('', null).optional(),
}).min(1);

function validate(schema) {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });
    if (error) {
      const fields = error.details.map((d) => d.context && d.context.key).filter(Boolean);
      return next(createError(400, ERRORS.VALIDATION_ERROR, '請求欄位驗證失敗', fields));
    }
    req.body = value;
    return next();
  };
}

module.exports = { validate, createReservationSchema, modifyReservationSchema, updateStatusSchema };
