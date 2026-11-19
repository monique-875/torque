const UsuarioService = require('../service/UsuarioService');

async function login(req, res) {
  const { email, senha } = req.body;

  try {
    const resultado = await UsuarioService.autenticar(email, senha);

    if (!resultado) {
      return res.status(401).json({ mensagem: 'E-mail ou senha invalidos' });
    }

    return res.json(resultado);
  } catch (erro) {
    console.error('Erro ao autenticar usuario:', erro);
    return res.status(500).json({
      mensagem: 'Erro ao acessar o banco de dados. Verifique as configuracoes da API.',
    });
  }
}

module.exports = { login };
