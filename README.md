# Torque - Sistema da Oficina Mecanica

Projeto de estudo (SENAI) para controle de clientes, veiculos e agendamentos
de uma oficina mecanica, com protecao do CPF (LGPD) e login com token JWT.

## Estrutura

```
database/           script.sql (gerado pelo backend)
backend/             Node + Express, rotas declaradas em src/app.js
frontend-html/       HTML, CSS e JS puros
frontend-react/      React + Vite
docs/                requisitos.md e der.md
oficina-exercicio/   copia do projeto com TODOs para o aluno praticar
```

## 1. Banco de dados

1. Tenha um MySQL rodando localmente.
2. Rode o arquivo `database/script.sql` (ele cria o banco `oficina`, as
   tabelas e insere os dados de teste, inclusive o usuario de login).

   ```bash
   mysql -u root -p < database/script.sql
   ```

   Esse arquivo ja vem gerado. Se quiser gera-lo novamente (por exemplo,
   apos mudar a chave de criptografia no `.env`), rode dentro de `backend/`:

   ```bash
   npm run gerar-script
   ```

   Para gerar apenas o hash da senha de teste e os CPFs criptografados:

   ```bash
   npm run gerar-valores
   ```

## 2. Aplicacao Mustache e API

```bash
cd backend
cp .env.example .env   # ajuste os dados do seu MySQL
npm install
npm start
```

A aplicacao com paginas renderizadas por Mustache e a API sobem juntas em
`http://localhost:3000`. Acesse `/` para entrar; depois do login, clientes,
veiculos e agendamentos sao carregados pelo servidor. A sessao usa um cookie
HTTP-only e as paginas continuam protegidas pelo JWT.

Os endpoints JSON estao disponiveis em `/api/login`, `/api/clientes`,
`/api/veiculos` e `/api/agendamentos`.

## 3. Frontend React

```bash
cd frontend-react
npm install
npm run dev
```

Acesse o endereco mostrado pelo Vite (normalmente `http://localhost:5173`).
A API precisa estar rodando.

## Usuario de teste

- E-mail: `admin@oficina.com`
- Senha: `123456`

## Exercicio

A pasta `oficina-exercicio/` tem a mesma estrutura, mas com os trechos das
regras RN03, RN05, RN07, RN08 e RN10 removidos e marcados com `// TODO`.
Use-a para praticar a implementacao dessas regras.
