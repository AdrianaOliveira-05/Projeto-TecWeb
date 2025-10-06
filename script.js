// Selecionar elementos principais
const identificacao = document.getElementById("identificacao");
const configuracao = document.getElementById("configuracao");
const comandos = document.getElementById("comandos");
const jogo = document.getElementById("jogo");

const comandosAntes = document.getElementById("comandosAntes");
const comandosDurante = document.getElementById("comandosDurante");

// Botões principais
const btnLogin = document.getElementById("btnLogin");
const btnIniciarJogo = document.getElementById("btnIniciarJogo");
const btnDesistir = document.getElementById("btnDesistir");

// Painéis de Instruções e Classificações
const painelInstrucoes = document.getElementById("instrucoes");
const painelClassificacoes = document.getElementById("classificacoes");
const botoesFechar = document.querySelectorAll(".btnFechar");

const btnVerInstrucoes = document.getElementById("btnVerInstrucoes");
const btnVerInstrucoes2 = document.getElementById("btnVerInstrucoes2");
const btnVerClassificacoes = document.getElementById("btnVerClassificacoes");
const btnVerClassificacoes2 = document.getElementById("btnVerClassificacoes2");

// =====================
// ESTADO INICIAL
// =====================
window.addEventListener("DOMContentLoaded", () => {
  // Mostra apenas a identificação
  identificacao.classList.remove("oculto");
  configuracao.classList.add("oculto");
  comandos.classList.add("oculto");
  jogo.classList.add("oculto");

  // Garante que apenas comandosAntes está visível no início
  comandosAntes.classList.remove("oculto");
  comandosDurante.classList.add("oculto");
});

// =====================
// LOGIN
// =====================
btnLogin.addEventListener("click", () => {
  const user = document.getElementById("user").value.trim();

  if (user === "") {
    alert("Insere o nome de utilizador!");
    return;
  }

  // Esconde a identificação
  identificacao.classList.add("oculto");

  // Mostra configuração e comandos
  configuracao.classList.remove("oculto");
  comandos.classList.remove("oculto");

  // Garante que apenas comandosAntes é visível
  comandosAntes.classList.remove("oculto");
  comandosDurante.classList.add("oculto");
});

// =====================
// INICIAR JOGO
// =====================
btnIniciarJogo.addEventListener("click", () => {
  // Esconde configuração
  configuracao.classList.add("oculto");

  // Mostra tabuleiro, dado e mensagens
  jogo.classList.remove("oculto");

  // Troca comandos: antes → durante
  comandosAntes.classList.add("oculto");
  comandosDurante.classList.remove("oculto");
});

// =====================
// DESISTIR
// =====================
btnDesistir.addEventListener("click", () => {
  // Esconde jogo
  jogo.classList.add("oculto");

  // Mostra configuração novamente
  configuracao.classList.remove("oculto");

  // Volta aos comandosAntes
  comandosDurante.classList.add("oculto");
  comandosAntes.classList.remove("oculto");
});

// =====================
// PAINÉIS (Instruções e Classificações)
// =====================
function abrirPainel(painel) {
  painel.classList.remove("oculto");
}

function fecharPainel() {
  painelInstrucoes.classList.add("oculto");
  painelClassificacoes.classList.add("oculto");
}

btnVerInstrucoes.addEventListener("click", () => abrirPainel(painelInstrucoes));
btnVerInstrucoes2.addEventListener("click", () => abrirPainel(painelInstrucoes));

btnVerClassificacoes.addEventListener("click", () => abrirPainel(painelClassificacoes));
btnVerClassificacoes2.addEventListener("click", () => abrirPainel(painelClassificacoes));

botoesFechar.forEach(btn => btn.addEventListener("click", fecharPainel));
