const VeiculoRepository = require('../repositories/VeiculoRepository');

async function listar() {
  return VeiculoRepository.listarTodos();
}

async function cadastrar(clienteId, placa, marca, modelo, ano) {
  if (!clienteId) {
    return { erro: 'cliente_id e obrigatorio' };
  }

  const id = await VeiculoRepository.cadastrar(clienteId, placa, marca, modelo, ano);
  return { id, cliente_id: clienteId, placa, marca, modelo, ano };
}

async function atualizar(id, clienteId, placa, marca, modelo, ano) {
  if (!clienteId) {
    return { erro: 'cliente_id e obrigatorio' };
  }

  await VeiculoRepository.atualizar(id, clienteId, placa, marca, modelo, ano);
  return { id, cliente_id: clienteId, placa, marca, modelo, ano };
}

async function excluir(id) {
  await VeiculoRepository.excluir(id);
}

module.exports = { listar, cadastrar, atualizar, excluir };
