function createError(status, code, message, fields) {
  const err = new Error(message);
  err.status = status;
  err.code = code;
  if (fields) err.fields = fields;
  return err;
}

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  const status = err.status || 500;
  const body = {
    error: {
      code: err.code || 'INTERNAL_ERROR',
      message: err.message || 'Internal server error',
    },
  };
  if (err.fields) body.error.fields = err.fields;
  res.status(status).json(body);
}

module.exports = { createError, errorHandler };
