const db = require('../config/db');

async function listarTodos() {
  const [linhas] = await db.query('SELECT * FROM clientes');
  return linhas;
}

async function buscarPorNome(termo) {
  const [linhas] = await db.query('SELECT * FROM clientes WHERE nome LIKE ?', [`%${termo}%`]);
  return linhas;
}

async function buscarPorId(id) {
  const [linhas] = await db.query('SELECT * FROM clientes WHERE id = ?', [id]);
  return linhas[0];
}

async function atualizar(id, nome, cpfCriptografado, telefone, email) {
  await db.query(
    'UPDATE clientes SET nome = ?, cpf = ?, telefone = ?, email = ? WHERE id = ?',
    [nome, cpfCriptografado, telefone, email, id]
  );
}

async function cadastrar(nome, cpfCriptografado, telefone, email) {
  const [resultado] = await db.query(
    'INSERT INTO clientes (nome, cpf, telefone, email) VALUES (?, ?, ?, ?)',
    [nome, cpfCriptografado, telefone, email]
  );
  return resultado.insertId;
}

async function excluir(id) {
  await db.query('DELETE FROM clientes WHERE id = ?', [id]);
}

module.exports = { listarTodos, buscarPorNome, buscarPorId, atualizar, cadastrar, excluir };
