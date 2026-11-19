const ClienteService = require('../service/ClienteService');

async function listar(req, res) {
  const { busca } = req.query;
  const clientes = await ClienteService.listar(busca);
  res.json(clientes);
}

async function atualizar(req, res) {
  const { id } = req.params;
  const { nome, cpf, telefone, email } = req.body;

  const clienteAtualizado = await ClienteService.atualizar(id, nome, cpf, telefone, email);
  res.json(clienteAtualizado);
}

async function cadastrar(req, res) {
  const { nome, cpf, telefone, email } = req.body;

  const cliente = await ClienteService.cadastrar(nome, cpf, telefone, email);
  res.status(201).json(cliente);
}

async function excluir(req, res) {
  const { id } = req.params;

  await ClienteService.excluir(id);
  res.json({ mensagem: 'Cliente removido' });
}

module.exports = { listar, atualizar, cadastrar, excluir };
