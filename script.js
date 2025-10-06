// =====================
// SELETORES PRINCIPAIS
// =====================
const identificacao = document.getElementById("identificacao");
const configuracao = document.getElementById("configuracao");
const comandos = document.getElementById("comandos");
const jogo = document.getElementById("jogo");
const gameGrid = document.getElementById("gameGrid");

// CONJUNTOS DE COMANDOS
const comandosAntes = document.getElementById("comandosAntes");
const comandosDurante = document.getElementById("comandosDurante");

// BOTÕES
const btnLogin = document.getElementById("btnLogin");
const btnIniciarJogo = document.getElementById("btnIniciarJogo");
const btnDesistir = document.getElementById("btnDesistir");

// PAINÉIS
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
  identificacao.classList.remove("oculto");
  configuracao.classList.add("oculto");
  comandos.classList.add("oculto");
  jogo.classList.add("oculto");

  comandosAntes.classList.remove("oculto");
  comandosDurante.classList.add("oculto");
});

// =====================
// LOGIN
// =====================
btnLogin.addEventListener("click", () => {
  identificacao.classList.add("oculto");
  configuracao.classList.remove("oculto");
  comandos.classList.remove("oculto");

  comandosAntes.classList.remove("oculto");
  comandosDurante.classList.add("oculto");
});

// =====================
// GERAR TABULEIRO
// =====================
function gerarTabuleiro() {
  gameGrid.innerHTML = "";

  // Obter tamanho (ex: "4x9")
  const tamanhoSelecionado = configuracao.querySelector("select").value;
  const numeros = tamanhoSelecionado.match(/\d+/g);
  const linhas = parseInt(numeros[0]);
  const colunas = parseInt(numeros[1]);

  // Impedir número par de colunas
  if (colunas % 2 === 0) {
    document.getElementById("mensagemTexto").innerText =
      "⚠️ O número de colunas deve ser ímpar. Escolhe outro tamanho!";
    return false;
  }

  // Limpar mensagens anteriores
  document.getElementById("mensagemTexto").innerText = "Jogo iniciado! Boa sorte!";

  // Criar grid
  gameGrid.style.gridTemplateColumns = `repeat(${colunas}, 40px)`;
  const total = linhas * colunas;
  for (let i = 0; i < total; i++) {
    const cell = document.createElement("div");
    cell.classList.add("cell");
    gameGrid.appendChild(cell);
  }

  return true;
}

// =====================
// INICIAR JOGO
// =====================
btnIniciarJogo.addEventListener("click", () => {
  const valido = gerarTabuleiro();
  if (!valido) return;

  configuracao.classList.add("oculto");
  jogo.classList.remove("oculto");

  comandosAntes.classList.add("oculto");
  comandosDurante.classList.remove("oculto");
});

// =====================
// DESISTIR
// =====================
btnDesistir.addEventListener("click", () => {
  jogo.classList.add("oculto");
  configuracao.classList.remove("oculto");

  comandosDurante.classList.add("oculto");
  comandosAntes.classList.remove("oculto");

  document.getElementById("mensagemTexto").innerText = "Jogo terminado ou cancelado.";
});

// =====================
// PAINÉIS (Instruções / Classificações)
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
