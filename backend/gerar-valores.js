require('dotenv').config();
const bcrypt = require('bcryptjs');
const { criptografarCpf } = require('./src/utils/cripto');

const senhaHash = bcrypt.hashSync('123456', 10);

console.log('Hash da senha 123456:', senhaHash);
console.log('CPF 11122233344:', criptografarCpf('11122233344'));
console.log('CPF 22233344455:', criptografarCpf('22233344455'));
console.log('CPF 33344455566:', criptografarCpf('33344455566'));
