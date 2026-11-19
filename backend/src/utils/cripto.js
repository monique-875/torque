require('dotenv').config();
const crypto = require('crypto');

const ALGORITMO = 'aes-256-cbc';
const CHAVE = process.env.CRIPTO_CHAVE;
const IV = process.env.CRIPTO_IV;

function criptografarCpf(cpfTexto) {
  const cifra = crypto.createCipheriv(ALGORITMO, CHAVE, IV);
  const criptografado = cifra.update(cpfTexto, 'utf8', 'hex') + cifra.final('hex');
  return criptografado;
}

function descriptografarCpf(cpfCriptografado) {
  const decifra = crypto.createDecipheriv(ALGORITMO, CHAVE, IV);
  const original = decifra.update(cpfCriptografado, 'hex', 'utf8') + decifra.final('utf8');
  return original;
}

module.exports = { criptografarCpf, descriptografarCpf };
