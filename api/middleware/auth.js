const jwt = require('jsonwebtoken');
const { createError } = require('./errorHandler');
const ERRORS = require('../constants/errors');

function requireAdmin(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(createError(401, ERRORS.UNAUTHORIZED, 'Unauthorized'));
  }

  const token = authHeader.slice(7);
  try {
    req.admin = jwt.verify(token, process.env.JWT_SECRET);
    return next();
  } catch {
    return next(createError(401, ERRORS.UNAUTHORIZED, 'Unauthorized'));
  }
}

module.exports = { requireAdmin };
