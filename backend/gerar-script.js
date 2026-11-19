
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const { criptografarCpf } = require('./src/utils/cripto');

const senhaHash = bcrypt.hashSync('123456', 10);

const cpf1 = criptografarCpf('11122233344');
const cpf2 = criptografarCpf('22233344455');
const cpf3 = criptografarCpf('33344455566');

const sql = `CREATE DATABASE IF NOT EXISTS oficina;
USE oficina;

CREATE TABLE usuarios (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nome VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL UNIQUE,
  senha VARCHAR(255) NOT NULL
);

CREATE TABLE clientes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nome VARCHAR(100) NOT NULL,
  cpf VARCHAR(255) NOT NULL,
  telefone VARCHAR(20),
  email VARCHAR(100)
);

CREATE TABLE veiculos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  cliente_id INT NOT NULL,
  placa VARCHAR(10) NOT NULL,
  marca VARCHAR(50),
  modelo VARCHAR(50),
  ano INT,
  FOREIGN KEY (cliente_id) REFERENCES clientes(id)
);

CREATE TABLE agendamentos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  veiculo_id INT NOT NULL,
  data_agendamento DATETIME NOT NULL,
  servico VARCHAR(100),
  FOREIGN KEY (veiculo_id) REFERENCES veiculos(id)
);

INSERT INTO usuarios (nome, email, senha) VALUES
  ('Administrador', 'admin@oficina.com', '${senhaHash}'),
  ('Carlos Mecanico', 'carlos@oficina.com', '${senhaHash}'),
  ('Fernanda Atendente', 'fernanda@oficina.com', '${senhaHash}');

INSERT INTO clientes (nome, cpf, telefone, email) VALUES
  ('Joao da Silva', '${cpf1}', '(11) 90000-1111', 'joao.silva@email.com'),
  ('Maria Souza', '${cpf2}', '(11) 90000-2222', 'maria.souza@email.com'),
  ('Pedro Oliveira', '${cpf3}', '(11) 90000-3333', 'pedro.oliveira@email.com');

INSERT INTO veiculos (cliente_id, placa, marca, modelo, ano) VALUES
  (1, 'ABC1D23', 'Volkswagen', 'Gol', 2018),
  (2, 'DEF4E56', 'Fiat', 'Palio', 2015),
  (3, 'GHI7F89', 'Chevrolet', 'Onix', 2021);

INSERT INTO agendamentos (veiculo_id, data_agendamento, servico) VALUES
  (2, '2026-11-05 09:00:00', 'Troca de oleo'),
  (1, '2026-10-20 14:30:00', 'Alinhamento e balanceamento'),
  (3, '2026-10-28 08:00:00', 'Revisao dos freios');
`;

const caminhoSaida = path.join(__dirname, '..', 'database', 'script.sql');
fs.writeFileSync(caminhoSaida, sql);
console.log(`Arquivo gerado em ${caminhoSaida}`);
