const db = require('../index');

function findByEmail(email) {
  return db.prepare('SELECT * FROM admins WHERE email = ?').get(email);
}

function findById(id) {
  return db.prepare('SELECT id, email FROM admins WHERE id = ?').get(id);
}

module.exports = { findByEmail, findById };
