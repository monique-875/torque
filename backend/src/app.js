require('dotenv').config();
const fs = require('fs');
const path = require('path');
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const Mustache = require('mustache');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const auth = require('./middlewares/auth');
const db = require('./config/db');
const UsuarioService = require('./service/UsuarioService');
const ClienteService = require('./service/ClienteService');
const VeiculoService = require('./service/VeiculoService');
const { criptografarCpf, descriptografarCpf } = require('./utils/cripto');

const app = express();
const caminhoPaginas = path.resolve(__dirname, '../../paginas');

app.use(cors());
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cookieParser());

app.use((req, res, next) => {
  const metodo = String((req.body && req.body._method) || '').toUpperCase();
  if (req.method === 'POST' && ['PUT', 'DELETE'].includes(metodo)) {
    req.method = metodo;
  }
  next();
});

function mostrar(nome, dados = {}) {
  const arquivo = path.join(caminhoPaginas, `${nome}.html`);
  const html = fs.readFileSync(arquivo, 'utf8');
  return Mustache.render(html, dados);
}

function paginaAutenticada(req, res, next) {
  const token = req.cookies.token;

  if (!token) {
    return res.redirect('/');
  }

  try {
    req.usuario = jwt.verify(token, process.env.JWT_SECRET);
    return next();
  } catch (erro) {
    res.clearCookie('token');
    return res.redirect('/');
  }
}

function tratarErro(handler) {
  return (req, res, next) => Promise.resolve(handler(req, res, next)).catch(next);
}

function dataParaInput(data) {
  return String(data || '').slice(0, 16).replace(' ', 'T');
}

function mapearClientesParaVeiculos(clientes, clienteSelecionado = '') {
  return clientes.map(({ id, nome }) => ({
    id,
    nome,
    selecionado: String(id) === String(clienteSelecionado)
  }));
}

app.get('/', (req, res) => {
  res.send(mostrar('index'));
});

app.post('/login', tratarErro(async (req, res) => {
  const [usuarios] = await db.query(
    'SELECT * FROM usuarios WHERE email = ?',
    [req.body.email]
  );
  const usuario = usuarios[0];
  if (!usuario || !(await bcrypt.compare(req.body.senha, usuario.senha))) {
    return res.status(401).send(mostrar('index', {
      erro: 'E-mail ou senha inválidos.'
    }));
  }

  const token = jwt.sign(
    { id: usuario.id, nome: usuario.nome },
    process.env.JWT_SECRET,
    { expiresIn: '1h' }
  );
  res.cookie('token', token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 1000
  });
  return res.redirect('/principal');
}));

app.post('/sair', (req, res) => {
  res.clearCookie('token');
  res.redirect('/');
});

app.get('/principal', paginaAutenticada, (req, res) => {
  res.send(mostrar('principal', { nome: req.usuario.nome }));
});

app.get('/clientes', paginaAutenticada, tratarErro(async (req, res) => {
  const busca = req.query.busca || '';
  const [registros] = busca
    ? await db.query('SELECT * FROM clientes WHERE nome LIKE ?', [`%${busca}%`])
    : await db.query('SELECT * FROM clientes');
  let avisoCpf = false;
  const clientes = registros.map((cliente) => {
    let cpf = '';
    let cpfDisponivel = true;

    try {
      cpf = descriptografarCpf(cliente.cpf);
    } catch (erro) {
      if (erro.code !== 'ERR_OSSL_BAD_DECRYPT') {
        throw erro;
      }
      cpfDisponivel = false;
      avisoCpf = true;
    }

    return {
      ...cliente,
      cpf,
      cpfExibicao: cpfDisponivel ? cpf : 'Indisponivel'
    };
  });
  const clienteEdicao = clientes.find(
    (cliente) => String(cliente.id) === String(req.query.editar)
  );

  res.send(mostrar('clientes', {
    clientes,
    busca,
    clienteEdicao,
    avisoCpf,
    erro: '',
    nomeFormulario: clienteEdicao ? 'Editar cliente' : 'Cadastrar cliente',
    acaoFormulario: clienteEdicao ? `/clientes/${clienteEdicao.id}` : '/clientes',
    nome: req.usuario.nome
  }));
}));

app.post('/clientes', paginaAutenticada, tratarErro(async (req, res) => {
  const { nome, cpf, telefone, email } = req.body;
  const cpfCriptografado = criptografarCpf(cpf);
  await db.query(
    'INSERT INTO clientes (nome, cpf, telefone, email) VALUES (?, ?, ?, ?)',
    [nome, cpfCriptografado, telefone, email]
  );
  res.redirect('/clientes');
}));

app.put('/clientes/:id', paginaAutenticada, tratarErro(async (req, res) => {
  const { nome, cpf, telefone, email } = req.body;
  const cpfCriptografado = criptografarCpf(cpf);
  await db.query(
    'UPDATE clientes SET nome = ?, cpf = ?, telefone = ?, email = ? WHERE id = ?',
    [nome, cpfCriptografado, telefone, email, req.params.id]
  );
  res.redirect('/clientes');
}));

app.delete('/clientes/:id', paginaAutenticada, tratarErro(async (req, res) => {
  await db.query('DELETE FROM clientes WHERE id = ?', [req.params.id]);
  res.redirect('/clientes');
}));

app.get('/veiculos', paginaAutenticada, tratarErro(async (req, res) => {
  const [veiculos] = await db.query(
    `SELECT veiculos.*, clientes.nome AS cliente_nome
     FROM veiculos
     JOIN clientes ON clientes.id = veiculos.cliente_id`
  );
  const [clientes] = await db.query('SELECT id, nome FROM clientes');
  const veiculoEdicao = veiculos.find(
    (veiculo) => String(veiculo.id) === String(req.query.editar)
  );

  res.send(mostrar('veiculos', {
    veiculos,
    clientes: mapearClientesParaVeiculos(
      clientes,
      veiculoEdicao ? veiculoEdicao.cliente_id : ''
    ),
    formulario: veiculoEdicao || {},
    editando: Boolean(veiculoEdicao),
    acaoFormulario: veiculoEdicao ? `/veiculos/${veiculoEdicao.id}` : '/veiculos',
    erro: '',
    nome: req.usuario.nome
  }));
}));

app.post('/veiculos', paginaAutenticada, tratarErro(async (req, res) => {
  const { cliente_id, placa, marca, modelo, ano } = req.body;
  const [clientes] = await db.query('SELECT id FROM clientes WHERE id = ?', [cliente_id]);
  if (!clientes.length) {
    return res.status(400).send('Selecione um cliente valido.');
  }
  await db.query(
    'INSERT INTO veiculos (cliente_id, placa, marca, modelo, ano) VALUES (?, ?, ?, ?, ?)',
    [cliente_id, placa, marca, modelo, ano]
  );
  return res.redirect('/veiculos');
}));

app.put('/veiculos/:id', paginaAutenticada, tratarErro(async (req, res) => {
  const { cliente_id, placa, marca, modelo, ano } = req.body;
  const [clientes] = await db.query('SELECT id FROM clientes WHERE id = ?', [cliente_id]);
  if (!clientes.length) {
    return res.status(400).send('Selecione um cliente valido.');
  }
  await db.query(
    'UPDATE veiculos SET cliente_id = ?, placa = ?, marca = ?, modelo = ?, ano = ? WHERE id = ?',
    [cliente_id, placa, marca, modelo, ano, req.params.id]
  );
  return res.redirect('/veiculos');
}));

app.delete('/veiculos/:id', paginaAutenticada, tratarErro(async (req, res) => {
  await db.query('DELETE FROM veiculos WHERE id = ?', [req.params.id]);
  res.redirect('/veiculos');
}));

app.get('/agendamentos', async (req, res, next) => {
  const token = req.cookies.token;
  if (!token) {
    return res.redirect('/');
  }

  try {
    req.usuario = jwt.verify(token, process.env.JWT_SECRET);
  } catch (erro) {
    res.clearCookie('token');
    return res.redirect('/');
  }

  try {
    const [lista] = await db.query(
      'SELECT * FROM agendamentos ORDER BY data_agendamento'
    );
    const [veiculos] = await db.query('SELECT * FROM veiculos');
    const [clientes] = await db.query('SELECT id, nome FROM clientes');
    const clientesPorId = new Map(
      clientes.map((cliente) => [String(cliente.id), cliente.nome])
    );
    const veiculosComCliente = veiculos.map((veiculo) => ({
      ...veiculo,
      cliente_nome: clientesPorId.get(String(veiculo.cliente_id))
    }));
    const veiculosPorId = new Map(
      veiculosComCliente.map((veiculo) => [String(veiculo.id), veiculo])
    );
    const agendamentos = lista.map((agendamento) => ({
      ...agendamento,
      ...veiculosPorId.get(String(agendamento.veiculo_id)),
      data_br: new Date(agendamento.data_agendamento).toLocaleDateString('pt-BR'),
      data_input: dataParaInput(agendamento.data_agendamento)
    }));

    return res.send(mostrar('agendamentos', {
      agendamentos,
      veiculos: veiculosComCliente,
      nome: req.usuario.nome
    }));
  } catch (erro) {
    return next(erro);
  }
});

app.post('/agendamentos', async (req, res) => {
  const { veiculo_id, data_agendamento, servico } = req.body;
  await db.query(
    'INSERT INTO agendamentos (veiculo_id, data_agendamento, servico) VALUES (?, ?, ?)',
    [veiculo_id, data_agendamento.replace('T', ' '), servico]
  );
  res.redirect('/agendamentos');
});

app.put('/agendamentos/:id', paginaAutenticada, tratarErro(async (req, res) => {
  await db.query(
    'UPDATE agendamentos SET data_agendamento = ? WHERE id = ?',
    [req.body.data_agendamento.replace('T', ' '), req.params.id]
  );
  res.redirect('/agendamentos');
}));

app.delete('/agendamentos/:id', paginaAutenticada, tratarErro(async (req, res) => {
  await db.query('DELETE FROM agendamentos WHERE id = ?', [req.params.id]);
  res.redirect('/agendamentos');
}));

app.get('/index.html', (req, res) => res.redirect('/'));
app.get('/principal.html', (req, res) => res.redirect('/principal'));
app.get('/clientes.html', (req, res) => res.redirect('/clientes'));
app.get('/veiculos.html', (req, res) => res.redirect('/veiculos'));
app.get('/agendamentos.html', (req, res) => res.redirect('/agendamentos'));

app.post('/api/login', tratarErro(async (req, res) => {
  const resultado = await UsuarioService.autenticar(req.body.email, req.body.senha);
  if (!resultado) {
    return res.status(401).json({ mensagem: 'E-mail ou senha invalidos' });
  }
  res.json(resultado);
}));

app.get('/api/clientes', auth, tratarErro(async (req, res) => {
  try {
    const clientes = await ClienteService.listar(req.query.busca);
    return res.json(clientes);
  } catch (erro) {
    if (erro.code !== 'ERR_OSSL_BAD_DECRYPT') {
      throw erro;
    }
    console.error('Nao foi possivel descriptografar os CPFs dos clientes.');
    return res.status(503).json({
      mensagem: 'A chave de criptografia nao corresponde aos CPFs salvos no banco.'
    });
  }
}));

app.post('/api/clientes', auth, tratarErro(async (req, res) => {
  const { nome, cpf, telefone, email } = req.body;
  const cliente = await ClienteService.cadastrar(nome, cpf, telefone, email);
  res.status(201).json(cliente);
}));

app.put('/api/clientes/:id', auth, tratarErro(async (req, res) => {
  const { nome, cpf, telefone, email } = req.body;
  const cliente = await ClienteService.atualizar(req.params.id, nome, cpf, telefone, email);
  res.json(cliente);
}));

app.delete('/api/clientes/:id', auth, tratarErro(async (req, res) => {
  await ClienteService.excluir(req.params.id);
  res.json({ mensagem: 'Cliente removido' });
}));

app.get('/api/veiculos', auth, tratarErro(async (req, res) => {
  const veiculos = await VeiculoService.listar();
  res.json(veiculos);
}));

app.post('/api/veiculos', auth, tratarErro(async (req, res) => {
  const { cliente_id, placa, marca, modelo, ano } = req.body;
  const resultado = await VeiculoService.cadastrar(cliente_id, placa, marca, modelo, ano);
  if (resultado.erro) {
    return res.status(400).json({ mensagem: resultado.erro });
  }
  res.status(201).json(resultado);
}));

app.put('/api/veiculos/:id', auth, tratarErro(async (req, res) => {
  const { cliente_id, placa, marca, modelo, ano } = req.body;
  const resultado = await VeiculoService.atualizar(
    req.params.id,
    cliente_id,
    placa,
    marca,
    modelo,
    ano
  );
  if (resultado.erro) {
    return res.status(400).json({ mensagem: resultado.erro });
  }
  res.json(resultado);
}));

app.delete('/api/veiculos/:id', auth, tratarErro(async (req, res) => {
  await VeiculoService.excluir(req.params.id);
  res.json({ mensagem: 'Veiculo removido' });
}));

app.get('/api/agendamentos', auth, tratarErro(async (req, res) => {
  const [agendamentos] = await db.query(
    `SELECT
       agendamentos.id,
       agendamentos.data_agendamento,
       agendamentos.servico,
       veiculos.id AS veiculo_id,
       veiculos.placa,
       veiculos.marca,
       veiculos.modelo,
       veiculos.ano,
       clientes.id AS cliente_id,
       clientes.nome AS cliente_nome,
       clientes.telefone AS cliente_telefone,
       clientes.email AS cliente_email
     FROM agendamentos
     JOIN veiculos ON veiculos.id = agendamentos.veiculo_id
     JOIN clientes ON clientes.id = veiculos.cliente_id
     ORDER BY agendamentos.data_agendamento`
  );
  res.json(agendamentos);
}));

app.post('/api/agendamentos', auth, tratarErro(async (req, res) => {
  const { veiculo_id, data_agendamento, servico } = req.body;
  const [resultado] = await db.query(
    'INSERT INTO agendamentos (veiculo_id, data_agendamento, servico) VALUES (?, ?, ?)',
    [veiculo_id, data_agendamento.replace('T', ' '), servico]
  );
  res.status(201).json({
    id: resultado.insertId,
    veiculo_id,
    data_agendamento,
    servico
  });
}));

app.put('/api/agendamentos/:id', auth, tratarErro(async (req, res) => {
  const data_agendamento = req.body.data_agendamento.replace('T', ' ');
  await db.query(
    'UPDATE agendamentos SET data_agendamento = ? WHERE id = ?',
    [data_agendamento, req.params.id]
  );
  res.json({ id: req.params.id, data_agendamento });
}));

app.delete('/api/agendamentos/:id', auth, tratarErro(async (req, res) => {
  await db.query('DELETE FROM agendamentos WHERE id = ?', [req.params.id]);
  res.json({ mensagem: 'Agendamento removido' });
}));

app.use((erro, req, res, next) => {
  console.error('Erro ao processar requisicao:', erro);
  if (req.path.startsWith('/api/')) {
    return res.status(500).json({ mensagem: 'Erro interno do servidor.' });
  }
  res.status(500).send('Ocorreu um erro interno. Tente novamente.');
});

const porta = process.env.PORT || 3000;
app.listen(porta, () => {
  console.log(`Sistema da oficina rodando na porta ${porta}`);
});
