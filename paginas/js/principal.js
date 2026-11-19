const nome = localStorage.getItem('nome');

if (!localStorage.getItem('token')) {
  window.location.href = 'index.html';
}

document.getElementById('saudacao').textContent = `Ola, ${nome}`;

document.getElementById('botaoSair').addEventListener('click', () => {
  localStorage.removeItem('token');
  localStorage.removeItem('nome');
  window.location.href = 'index.html';
});
