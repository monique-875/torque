const AgendamentoRepository = require('../repositories/AgendamentoRepository');

async function listar() {
  return AgendamentoRepository.listarTodos();
}

async function atualizarData(id, novaData) {
  await AgendamentoRepository.atualizarData(id, novaData);
  return { id, data_agendamento: novaData };
}

async function cadastrar(veiculoId, dataAgendamento, servico) {
  const id = await AgendamentoRepository.cadastrar(veiculoId, dataAgendamento, servico);
  return { id, veiculo_id: veiculoId, data_agendamento: dataAgendamento, servico };
}

async function excluir(id) {
  await AgendamentoRepository.excluir(id);
}

module.exports = { listar, atualizarData, cadastrar, excluir };
