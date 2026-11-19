const db = require('../config/db');

async function buscarPorEmail(email) {
  const [linhas] = await db.query('SELECT * FROM usuarios WHERE email = ?', [email]);
  return linhas[0];
}

module.exports = { buscarPorEmail };
