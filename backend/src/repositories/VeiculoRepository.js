const db = require('../config/db');

async function listarTodos() {
  const [linhas] = await db.query('SELECT * FROM veiculos');
  return linhas;
}

async function cadastrar(clienteId, placa, marca, modelo, ano) {
  const [resultado] = await db.query(
    'INSERT INTO veiculos (cliente_id, placa, marca, modelo, ano) VALUES (?, ?, ?, ?, ?)',
    [clienteId, placa, marca, modelo, ano]
  );
  return resultado.insertId;
}

async function atualizar(id, clienteId, placa, marca, modelo, ano) {
  await db.query(
    'UPDATE veiculos SET cliente_id = ?, placa = ?, marca = ?, modelo = ?, ano = ? WHERE id = ?',
    [clienteId, placa, marca, modelo, ano, id]
  );
}

async function excluir(id) {
  await db.query('DELETE FROM veiculos WHERE id = ?', [id]);
}

module.exports = { listarTodos, cadastrar, atualizar, excluir };
