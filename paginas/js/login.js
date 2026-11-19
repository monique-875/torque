const formLogin = document.getElementById('formLogin');
const mensagemErro = document.getElementById('mensagemErro');

formLogin.addEventListener('submit', async (evento) => {
  evento.preventDefault();
  mensagemErro.textContent = '';

  const email = document.getElementById('email').value;
  const senha = document.getElementById('senha').value;

  try {
    const resposta = await fetch(API_URL + '/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, senha }),
    });

    const dados = await resposta.json();

    if (!resposta.ok) {
      mensagemErro.textContent = dados.mensagem || 'Nao foi possivel fazer login.';
      return;
    }

    localStorage.setItem('token', dados.token);
    localStorage.setItem('nome', dados.nome);
    window.location.href = 'principal.html';
  } catch (erro) {
    console.error('Falha ao realizar login:', erro);
    mensagemErro.textContent = 'Nao foi possivel conectar a API. Verifique se o servidor esta ativo.';
  }
});
