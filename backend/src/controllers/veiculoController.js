const VeiculoService = require('../service/VeiculoService');

async function listar(req, res) {
  const veiculos = await VeiculoService.listar();
  res.json(veiculos);
}

async function cadastrar(req, res) {
  const { cliente_id, placa, marca, modelo, ano } = req.body;

  const resultado = await VeiculoService.cadastrar(cliente_id, placa, marca, modelo, ano);

  if (resultado.erro) {
    return res.status(400).json({ mensagem: resultado.erro });
  }

  res.status(201).json(resultado);
}

async function atualizar(req, res) {
  const { id } = req.params;
  const { cliente_id, placa, marca, modelo, ano } = req.body;

  const resultado = await VeiculoService.atualizar(id, cliente_id, placa, marca, modelo, ano);

  if (resultado.erro) {
    return res.status(400).json({ mensagem: resultado.erro });
  }

  res.json(resultado);
}

async function excluir(req, res) {
  const { id } = req.params;

  await VeiculoService.excluir(id);
  res.json({ mensagem: 'Veiculo removido' });
}

module.exports = { listar, cadastrar, atualizar, excluir };
