/* =========================================================
   VARIÁVEIS PRINCIPAIS (Referências ao DOM)
   ========================================================= */
const identificacao = document.getElementById("identificacao");
const configuracao = document.getElementById("configuracao");
const comandos = document.getElementById("comandos");
const jogo = document.getElementById("jogo");
const gameGrid = document.getElementById("gameGrid");

const comandosAntes = document.getElementById("comandosAntes");
const comandosDurante = document.getElementById("comandosDurante");

const btnLogin = document.getElementById("btnLogin");
const btnIniciarJogo = document.getElementById("btnIniciarJogo");
const btnDesistir = document.getElementById("btnDesistir");

const dadoArea = document.getElementById("dadoArea");
const paus = document.querySelectorAll(".pau");
const resultadoDado = document.getElementById("resultadoDado");
const mensagemTexto = document.getElementById("mensagemTexto");

/* Painéis */
const painelInstrucoes = document.getElementById("instrucoes");
const painelClassificacoes = document.getElementById("classificacoes");
const botoesFechar = document.querySelectorAll(".btnFechar");

const btnVerInstrucoes = document.getElementById("btnVerInstrucoes");
const btnVerInstrucoes2 = document.getElementById("btnVerInstrucoes2");
const btnVerClassificacoes = document.getElementById("btnVerClassificacoes");
const btnVerClassificacoes2 = document.getElementById("btnVerClassificacoes2");


/* =========================================================
   ESTADO DE JOGO
   ========================================================= */
let tabuleiroDados = [];
let linhas = 4;
let colunas = 9;
let pathOrder = [];
let indexMap = [];
let jogadorAtual = "A";
let valorDadoAtual = null;
let casaSelecionada = null;
let destinosValidosSelecionados = new Set();
let pontuacaoA = 0;
let pontuacaoB = 0;
let jogoIniciado = false;
let nivelAtualIA = "fácil";

let dataInicioJogo = null;
let numeroJogo = 0;
let historicoJogos = JSON.parse(localStorage.getItem("historicoJogos") || "[]");


/* =========================================================
   FUNÇÕES AUXILIARES DE MOVIMENTO
   ========================================================= */

/* Grelha de setas para Jogador A (vista padrão) */
function getCellArrowsA(i, j) {
  if (i === 0) return j === 0 ? ["↙"] : (j === colunas - 1 ? ["↖"] : ["←"]);
  if (i === 1) return j === 0 ? ["↘", "↗"] : (j === colunas - 1 ? ["↗", "↘"] : ["→"]);
  if (i === 2) return j === 0 ? ["↖"] : (j === colunas - 1 ? ["↙", "↖"] : ["←"]);
  return j === colunas - 1 ? ["↗"] : ["→"];
}

/* Mapa de espelhamento de direção para Jogador B */
const mirrorMap = { "←":"→","→":"←","↖":"↗","↗":"↖","↘":"↙","↙":"↘","↑":"↑","↓":"↓" };

/* Devolve setas dependendo do jogador */
function getCellArrows(i, j, player) {
  const base = getCellArrowsA(i, j);
  return player === "A" ? base : base.map(s => mirrorMap[s] || s);
}

/* Movimentação simples em direção */
function stepFrom(i, j, dir) {
  return ({
    "←": { i, j: j - 1 }, "→": { i, j: j + 1 },
    "↑": { i: i - 1, j }, "↓": { i: i + 1, j },
    "↖": { i: i - 1, j: j - 1 }, "↗": { i: i - 1, j: j + 1 },
    "↘": { i: i + 1, j: j + 1 }, "↙": { i: i + 1, j: j - 1 }
  }[dir] || null);
}

function dentro(i, j) {
  return i >= 0 && i < linhas && j >= 0 && j < colunas;
}

function contaPecasDoJogador(owner) {
  let n = 0;
  for (let i = 0; i < linhas; i++)
    for (let j = 0; j < colunas; j++)
      if (tabuleiroDados[i][j]?.owner === owner) n++;
  return n;
}


/* =========================================================
   INTERFACE INICIAL
   ========================================================= */
window.addEventListener("DOMContentLoaded", () => {
  identificacao.classList.remove("oculto");
  configuracao.classList.add("oculto");
  comandos.classList.add("oculto");
  jogo.classList.add("oculto");
});

btnLogin.addEventListener("click", () => {
  identificacao.classList.add("oculto");
  configuracao.classList.remove("oculto");
  comandos.classList.remove("oculto");
  comandosDurante.classList.add("oculto");
});


/* =========================================================
   PAINÉIS DE INSTRUÇÕES & CLASSIFICAÇÕES
   ========================================================= */
function abrirPainel(painel) {
  painel.classList.remove("oculto");
}
function fecharPainel() {
  painelInstrucoes.classList.add("oculto");
  painelClassificacoes.classList.add("oculto");
}

btnVerInstrucoes.addEventListener("click", () => abrirPainel(painelInstrucoes));
btnVerInstrucoes2.addEventListener("click", () => abrirPainel(painelInstrucoes));

btnVerClassificacoes.addEventListener("click", () => { abrirPainel(painelClassificacoes); atualizarTabelaClassificacoes(); });
btnVerClassificacoes2.addEventListener("click", () => { abrirPainel(painelClassificacoes); atualizarTabelaClassificacoes(); });

botoesFechar.forEach(btn => btn.addEventListener("click", fecharPainel));


/* =========================================================
   GESTÃO DO HISTÓRICO DE JOGOS
   ========================================================= */
function registarResultado(vencedor, resultadoTexto, desistiu) {
  const jogoData = {
    jogo: numeroJogo,
    data: dataInicioJogo,
    nivelIA: nivelAtualIA.charAt(0).toUpperCase() + nivelAtualIA.slice(1),
    resultado: resultadoTexto,
    vencedor: vencedor
  };

  historicoJogos.push(jogoData);
  localStorage.setItem("historicoJogos", JSON.stringify(historicoJogos));
  atualizarTabelaClassificacoes();
}

function atualizarTabelaClassificacoes() {
  const corpo = document.querySelector("#tabelaClassificacoes tbody");
  corpo.innerHTML = "";
  historicoJogos.forEach(j => {
    const linha = document.createElement("tr");
    linha.innerHTML = `
      <td>${j.jogo}</td><td>${j.data}</td><td>${j.nivelIA}</td><td>${j.resultado}</td><td>${j.vencedor}</td>`;
    corpo.appendChild(linha);
  });
}

document.addEventListener("click", (e) => {
  if (e.target.id === "btnApagarHistorico") {
    if (confirm("Confirmas apagar todo o histórico de jogos?")) {
      localStorage.removeItem("historicoJogos");
      historicoJogos = [];
      atualizarTabelaClassificacoes();
    }
  }
});


/* =========================================================
   TABULEIRO: GERAÇÃO E DESENHO
   ========================================================= */
function construirPath(l, c) {
  pathOrder = [];
  indexMap = Array.from({ length: l }, () => Array(c).fill(0));
  for (let i = 0; i < l; i++) {
    const cols = (i % 2 === 0) ? [...Array(c).keys()] : [...Array(c).keys()].reverse();
    cols.forEach(j => {
      indexMap[i][j] = pathOrder.length;
      pathOrder.push({ i, j });
    });
  }
}

function inicializarTabuleiro(l, c) {
  tabuleiroDados = [];
  for (let i = 0; i < l; i++) {
    const linha = [];
    for (let j = 0; j < c; j++)
      linha.push(i === 0 ? { owner: "B", moved: false } : (i === l - 1 ? { owner: "A", moved: false } : null));
    tabuleiroDados.push(linha);
  }
  desenharTabuleiro();
}

function gerarTabuleiro() {
  const selectTamanho = configuracao.querySelector("select");
  const nums = selectTamanho.value.match(/\d+/g);
  linhas = parseInt(nums[0]); colunas = parseInt(nums[1]);
  if (colunas % 2 === 0) return false;

  construirPath(linhas, colunas);
  inicializarTabuleiro(linhas, colunas);
  gameGrid.style.gridTemplateColumns = `repeat(${colunas}, 40px)`;
  return true;
}

function desenharTabuleiro(destinos = []) {
  gameGrid.innerHTML = "";
  destinosValidosSelecionados.clear();

  tabuleiroDados.forEach((linha, i) => {
    linha.forEach((casa, j) => {
      const cell = document.createElement("div");
      cell.classList.add("cell");
      cell.dataset.linha = i;
      cell.dataset.coluna = j;

      /* Setas base (do jogador A) */
      const seta = getCellArrowsA(i, j);
      if (seta.length === 1) {
        const el = document.createElement("div");
        el.classList.add("seta-fundo");
        el.textContent = seta[0];
        cell.appendChild(el);
      } else if (seta.length === 2) {
        const cont = document.createElement("div");
        cont.classList.add("seta-dupla");
        seta.forEach((s, idx) => {
          const el = document.createElement("div");
          el.classList.add("seta-fundo", idx === 0 ? "seta1" : "seta2");
          el.textContent = s;
          cont.appendChild(el);
        });
        cell.appendChild(cont);
      }

      /* Peças */
      if (casa) {
        const p = document.createElement("div");
        p.classList.add("peca");
        p.style.background = casa.owner === "A" ? "royalblue" : "firebrick";
        cell.appendChild(p);
      }

      /* Destino possível */
      if (destinos.some(d => d.i === i && d.j === j)) {
        const alvo = document.createElement("div");
        alvo.classList.add("destino-transparente");
        cell.appendChild(alvo);
      }

      cell.addEventListener("click", () => selecionarCasa(i, j));
      gameGrid.appendChild(cell);
    });
  });
}


/* =========================================================
   DADO DE PAUS
   ========================================================= */
function lancarDado() {
  let claros = 0;
  paus.forEach(pau => {
    const claro = Math.random() < 0.5;
    pau.classList.toggle("escuro", !claro);
    if (claro) claros++;
  });

  valorDadoAtual = [6, 1, 2, 3, 4][claros];
  resultadoDado.textContent = `Resultado: ${valorDadoAtual}`;
}


/* =========================================================
   SELEÇÃO E MOVIMENTO DE PEÇAS
   ========================================================= */

/* Obtém destinos válidos para uma peça */
function destinosPossiveis(i, j) {
  const peca = tabuleiroDados[i][j];
  if (!peca || valorDadoAtual === null) return [];

  const passos = valorDadoAtual;
  const player = peca.owner;
  let direcao = (player === "A") ? (i % 2 === 1 ? 1 : -1) : (i % 2 === 0 ? 1 : -1);
  let sentido = (player === "A") ? -1 : 1;

  let ci = i, cj = j, dir = direcao, sen = sentido;
  for (let k = 0; k < passos; k++) {
    let ni = ci, nj = cj + dir;
    if (nj < 0 || nj >= colunas) {
      ni += sen;
      if (!dentro(ni, nj)) return [];
      dir *= -1;
      nj = Math.max(0, Math.min(colunas - 1, nj));
    }
    if (tabuleiroDados[ni][nj]?.owner === player) return [];
    ci = ni; cj = nj;
  }

  const destino = tabuleiroDados[ci][cj];
  return (!destino || destino.owner !== player) ? [{ i: ci, j: cj }] : [];
}

/* Selecionar origem ou destino */
function selecionarCasa(i, j) {
  const clicado = tabuleiroDados[i][j];
  if (valorDadoAtual === null) {
    mensagemTexto.innerText = "Lança o dado antes de mover.";
    return;
  }

  if (!casaSelecionada) {
    if (clicado?.owner === jogadorAtual) {
      casaSelecionada = { i, j };
      const destinos = destinosPossiveis(i, j);
      destacarSelecao(i, j);
      desenharTabuleiro(destinos);
      destinosValidosSelecionados = new Set(destinos.map(d => `${d.i},${d.j}`));
      return;
    }
    mensagemTexto.innerText = "Escolhe uma das tuas peças.";
    return;
  }

  const key = `${i},${j}`;
  if (destinosValidosSelecionados.has(key)) {
    moverPeca(casaSelecionada.i, casaSelecionada.j, i, j);
  }
  casaSelecionada = null;
  destinosValidosSelecionados.clear();
}

/* Realizar movimento */
function moverPeca(i1, j1, i2, j2) {
  const p1 = tabuleiroDados[i1][j1];
  if (!p1) return;
  const adversario = p1.owner === "A" ? "B" : "A";

  /* Captura */
  if (tabuleiroDados[i2][j2]?.owner === adversario) {
    if (p1.owner === "A") pontuacaoA++; else pontuacaoB++;
  }

  /* Movimento */
  tabuleiroDados[i2][j2] = { ...p1, moved: true };
  tabuleiroDados[i1][j1] = null;

  desenharTabuleiro([]);

  /* Verificar fim */
  if (contaPecasDoJogador("A") === 0 || contaPecasDoJogador("B") === 0) {
    const vencedor = pontuacaoA > pontuacaoB ? "Jogador Azul" : "Computador";
    const texto = `Azul: ${pontuacaoA} | Vermelho: ${pontuacaoB}`;
    registarResultado(vencedor, texto, false);
    mensagemTexto.innerText = `Fim do jogo. ${vencedor} venceu.`;
    return;
  }

  /* Controlar repetição de turno */
  const repete = [1, 4, 6].includes(valorDadoAtual);
  valorDadoAtual = null;
  resultadoDado.textContent = "Clique para lançar";

  if (!repete) alternarJogador();
}


/* =========================================================
   TURNO E IA
   ========================================================= */
function alternarJogador() {
  jogadorAtual = jogadorAtual === "A" ? "B" : "A";
  if (jogadorAtual === "B") setTimeout(jogadaComputador, 600);
}

/* IA: joga automaticamente de forma simples */
function jogadaComputador() {
  if (valorDadoAtual === null) lancarDado();

  const jogadas = [];
  for (let i = 0; i < linhas; i++)
    for (let j = 0; j < colunas; j++) {
      const p = tabuleiroDados[i][j];
      if (p?.owner !== "B") continue;
      destinosPossiveis(i, j).forEach(d => jogadas.push({ oi: i, oj: j, di: d.i, dj: d.j }));
    }

  if (jogadas.length === 0) {
    valorDadoAtual = null;
    alternarJogador();
    return;
  }

  const jogada = jogadas[Math.floor(Math.random() * jogadas.length)];
  moverPeca(jogada.oi, jogada.oj, jogada.di, jogada.dj);
}


/* =========================================================
   INICIAR, DESISTIR E REINICIAR JOGO
   ========================================================= */
btnIniciarJogo.addEventListener("click", () => {
  const selects = configuracao.querySelectorAll("select");
  nivelAtualIA = selects[3].value.toLowerCase();
  jogadorAtual = selects[2].value.toLowerCase().includes("computador") ? "B" : "A";
  gerarTabuleiro();

  dataInicioJogo = new Date().toLocaleString("pt-PT");
  numeroJogo = historicoJogos.length + 1;

  configuracao.classList.add("oculto");
  jogo.classList.remove("oculto");
  comandosAntes.classList.add("oculto");
  comandosDurante.classList.remove("oculto");

  mensagemTexto.innerText = jogadorAtual === "A" ?
    "O jogador começa. Clique no dado." :
    "O computador começa.";
  if (jogadorAtual === "B") jogadaComputador();
});

btnDesistir.addEventListener("click", () => {
  jogo.classList.add("oculto");
  configuracao.classList.remove("oculto");
  comandosDurante.classList.add("oculto");
  comandosAntes.classList.remove("oculto");

  const vencedor = "Jogador Vermelho";
  const texto = `Azul: ${pontuacaoA} | Vermelho: ${pontuacaoB} (Desistência)`;
  registarResultado(vencedor, texto, true);

  valorDadoAtual = null;
  resultadoDado.textContent = "Clique para lançar";
});
