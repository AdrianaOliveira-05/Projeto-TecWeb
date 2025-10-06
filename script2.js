// Selecionar elementos
const identificacao = document.getElementById("identificacao");
const configuracao = document.getElementById("configuracao");
const comandos = document.getElementById("comandos");
const jogo = document.getElementById("jogo");
const mensagens = document.getElementById("mensagens");

const comandosAntes = document.getElementById("comandosAntes");
const comandosDurante = document.getElementById("comandosDurante");

const btnLogin = document.getElementById("btnLogin");
const btnIniciarJogo = document.getElementById("btnIniciarJogo");
const btnDesistir = document.getElementById("btnDesistir");

// Painéis
const painelInstrucoes = document.getElementById("instrucoes");
const painelClassificacoes = document.getElementById("classificacoes");
const btnVerInstrucoes = document.getElementById("btnVerInstrucoes");
const btnVerInstrucoes2 = document.getElementById("btnVerInstrucoes2");
const btnVerClassificacoes = document.getElementById("btnVerClassificacoes");
const btnVerClassificacoes2 = document.getElementById("btnVerClassificacoes2");
const botoesFechar = document.querySelectorAll(".btnFechar");

// Estado inicial: apenas identificação
configuracao.classList.add("oculto");
comandos.classList.add("oculto");
jogo.classList.add("oculto");

// Login → mostra Configuração + Comandos
btnLogin.addEventListener("click", () => {
  const user = document.getElementById("user").value.trim();
  if (user === "") {
    alert("Insere o nome de utilizador!");
    return;
  }
  identificacao.classList.add("oculto");
  configuracao.classList.remove("oculto");
  comandos.classList.remove("oculto");
});

// Iniciar Jogo → mostra Tabuleiro, Dado, Mensagens + muda Comandos
btnIniciarJogo.addEventListener("click", () => {
  configuracao.classList.add("oculto");
  jogo.classList.remove("oculto");
  comandosAntes.classList.add("oculto");
  comandosDurante.classList.remove("oculto");
});

// Desistir → volta à Configuração
btnDesistir.addEventListener("click", () => {
  jogo.classList.add("oculto");
  configuracao.classList.remove("oculto");
  comandosDurante.classList.add("oculto");
  comandosAntes.classList.remove("oculto");
});

// Abrir / Fechar painéis
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
