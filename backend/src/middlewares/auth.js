require('dotenv').config();
const jwt = require('jsonwebtoken');

function verificarToken(token) {
  return jwt.verify(token, process.env.JWT_SECRET);
}

function auth(req, res, next) {
  const cabecalho = req.headers.authorization;

  if (!cabecalho) {
    return res.status(401).json({ mensagem: 'Token nao informado' });
  }

  const token = cabecalho.replace('Bearer ', '');

  try {
    req.usuario = verificarToken(token);
    next();
  } catch (erro) {
    return res.status(401).json({ mensagem: 'Token invalido ou expirado' });
  }
}

auth.verificarToken = verificarToken;

module.exports = auth;
