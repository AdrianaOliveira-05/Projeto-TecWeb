// =====================
//  definir variáveis//
// =====================


// SELETORES PRINCIPAIS 
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


// ESTADO DO JOGO

/**
 * Cada célula do tabuleiro tem:
 *  - null (vazia) ou um objeto { owner: 'A' | 'B', moved: boolean, visitedLast: boolean }
 * Movimento em “serpentina”:
 *   - Linha 0 e 2: esquerda → direita
 *   - Linha 1 e 3: direita → esquerda
 * O “avanço” é feito por um índice linear que percorre as células nesta ordem.
 */
let tabuleiroDados = [];  // array 2D com objetos ou null
let linhas = 4;
let colunas = 9;
let pathOrder = [];       // lista de coordenadas [{i,j}, ...] na ordem de movimento
let indexMap = [];        // indexMap[i][j] => índice linear na pathOrder

let jogadorAtual = "A";            // "A" (azul) começa
let valorDadoAtual = null;         // último valor do dado (global!)
let casaSelecionada = null;        // {i, j} da peça selecionada
let destinosValidosSelecionados = new Set(); // para destaque de casas válidas

const dadoArea = document.getElementById("dadoArea");
const paus = document.querySelectorAll(".pau");
const resultadoDado = document.getElementById("resultadoDado");
const mensagemTexto = document.getElementById("mensagemTexto");

// =====================
// ECRÃ INICIAL
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
// PAINÉIS
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

// =====================
// CLASSIFICAÇÕES (placeholder)
// =====================
function adicionarResultado(nome, data, dificuldade, tempo, resultado) {
  const tabela = document.querySelector("#tabelaClassificacoes tbody");
  const novaLinha = document.createElement("tr");
  const posicao = tabela ? tabela.rows.length + 1 : 1;
  if (!tabela) return;

  novaLinha.innerHTML = `
    <td>${posicao}</td>
    <td>${nome}</td>
    <td>${data}</td>
    <td>${dificuldade}</td>
    <td>${tempo}</td>
    <td>${resultado}</td>
  `;
  tabela.appendChild(novaLinha);
}

// =====================
// FUNÇÕES AUXILIARES (PATH)
// =====================
function construirPath(l, c) {
  pathOrder = [];
  indexMap = Array.from({ length: l }, () => Array(c).fill(0));
  for (let i = 0; i < l; i++) {
    if (i % 2 === 0) {
      // linha i: esquerda -> direita
      for (let j = 0; j < c; j++) {
        indexMap[i][j] = pathOrder.length;
        pathOrder.push({ i, j });
      }
    } else {
      // linha i: direita -> esquerda
      for (let j = c - 1; j >= 0; j--) {
        indexMap[i][j] = pathOrder.length;
        pathOrder.push({ i, j });
      }
    }
  }
}

function coordToIndex(i, j) {
  return indexMap[i][j];
}
function indexToCoord(idx) {
  return pathOrder[idx];
}

// =====================
// GERAR / DESENHAR TABULEIRO
// =====================
function gerarTabuleiro() {
  gameGrid.innerHTML = "";

  // Obter tamanho do primeiro <select> da secção configuração (ex: "4x9")
  const selectTamanho = configuracao.querySelector("select");
  const numeros = selectTamanho.value.match(/\d+/g);
  linhas = parseInt(numeros[0], 10);
  colunas = parseInt(numeros[1], 10);

  if (colunas % 2 === 0) {
    mensagemTexto.innerText = "⚠️ O número de colunas deve ser ímpar. Escolhe outro tamanho!";
    return false;
  }

  // Preparar path
  construirPath(linhas, colunas);

  inicializarTabuleiro(linhas, colunas);
  document.getElementById("mensagemTexto").innerText = "Jogo iniciado! Boa sorte!";

  gameGrid.style.gridTemplateColumns = `repeat(${colunas}, 40px)`;
  return true;
}

function desenharTabuleiro() {
  gameGrid.innerHTML = "";
  destinosValidosSelecionados.clear();

  for (let i = 0; i < tabuleiroDados.length; i++) {
    for (let j = 0; j < tabuleiroDados[i].length; j++) {
      const casa = document.createElement("div");
      casa.classList.add("cell");
      casa.dataset.linha = i;
      casa.dataset.coluna = j;

      const peca = tabuleiroDados[i][j];

      // === BASE VISUAL (setas do tabuleiro) ===
      const seta = document.createElement("div");
      seta.classList.add("seta-fundo");
      let simbolo = "";

      // Regras de direção principais
      if (i === 0) {
        if (j === 0) simbolo = "↙️";
        else if (j === colunas - 1) simbolo = "↘️";
        else simbolo = "⬅️";
      } else if (i === 1) {
        if (j === 0) simbolo = "↙️";
        else if (j === colunas - 1) simbolo = "↘️";
        else simbolo = "➡️";
      } else if (i === 2) {
        if (j === 0) simbolo = "↗️";
        else if (j === colunas - 1) simbolo = "↖️";
        else simbolo = "⬅️";
      } else if (i === 3) {
        if (j === 0) simbolo = "↗️";
        else if (j === colunas - 1) simbolo = "↖️";
        else simbolo = "➡️";
      }

      seta.textContent = simbolo;
      casa.appendChild(seta);

      // === PEÇA DO JOGADOR ===
      if (peca) {
        const circulo = document.createElement("div");
        circulo.classList.add("peca");
        circulo.style.background = peca.owner === "A" ? "royalblue" : "firebrick";
        casa.appendChild(circulo);
      }

      casa.addEventListener("click", () => selecionarCasa(i, j));
      gameGrid.appendChild(casa);
    }
  }
}

function destacarSelecao(i, j, destinos) {
  // Tirar qualquer destaque anterior
  Array.from(gameGrid.children).forEach(div => {
    div.style.outline = "none";
    div.style.boxShadow = "none";
  });

  // Destacar origem
  const idx = i * colunas + j;
  const origemDiv = gameGrid.children[idx];
  if (origemDiv) {
    origemDiv.style.outline = "2px solid #333";
    origemDiv.style.boxShadow = "0 0 8px rgba(0,0,0,0.35)";
  }

  // Destacar destinos
  destinos.forEach(({ i: di, j: dj }) => {
    const k = di * colunas + dj;
    const destDiv = gameGrid.children[k];
    if (destDiv) {
      destDiv.style.outline = "2px dashed #333";
      destDiv.style.boxShadow = "inset 0 0 0 3px rgba(0,0,0,0.25)";
      destinosValidosSelecionados.add(`${di},${dj}`);
    }
  });
}

// =====================
// ESTADO INICIAL DO TABULEIRO
// =====================
function inicializarTabuleiro(l, c) {
  tabuleiroDados = [];
  for (let i = 0; i < l; i++) {
    const linha = [];
    for (let j = 0; j < c; j++) {
      if (i === 0) {
        // Jogador B (vermelho) na primeira linha (topo)
        linha.push({ owner: "B", moved: false, visitedLast: false });
      } else if (i === l - 1) {
        // Jogador A (azul) na última linha (base)
        linha.push({ owner: "A", moved: false, visitedLast: false });
      } else {
        linha.push(null);
      }
    }
    tabuleiroDados.push(linha);
  }
  jogadorAtual = "A";
  valorDadoAtual = null;
  casaSelecionada = null;
  desenharTabuleiro();
}

// =====================
// DADO DE PAUS
// =====================
function lancarDado() {
  // 4 paus: claro (0) / escuro (1)
  let claros = 0;

  paus.forEach(pau => {
    const ladoClaro = Math.random() < 0.5;
    if (ladoClaro) {
      pau.classList.remove("escuro");
      claros++;
    } else {
      pau.classList.add("escuro");
    }
  });

  // Converter número de claros em valor do Tâb
  switch (claros) {
    case 0: valorDadoAtual = 6; break; // Sitteh
    case 1: valorDadoAtual = 1; break; // Tâb
    case 2: valorDadoAtual = 2; break; // Itneyn
    case 3: valorDadoAtual = 3; break; // Teláteh
    case 4: valorDadoAtual = 4; break; // Arba'ah
  }

  resultadoDado.textContent = `Resultado: ${valorDadoAtual}`;
  mensagemTexto.innerHTML = `<strong>Saiu ${valorDadoAtual}</strong> — ${[1,4,6].includes(valorDadoAtual) ? "repete o turno se jogares." : "depois passa a vez."}`;

  // pequeno efeito visual
  dadoArea.style.transform = "scale(1.08)";
  setTimeout(() => dadoArea.style.transform = "scale(1)", 160);
}

// Clique no dado
dadoArea.addEventListener("click", () => {
  // só lança se não houver um valor pendente
  if (valorDadoAtual !== null) {
    mensagemTexto.innerText = "Já tens um lançamento ativo. Usa-o antes de lançar de novo.";
    return;
  }
  lancarDado();
});

// =====================
// REGRAS DE MOVIMENTO
// =====================

function casaOcupadaPorAliado(i, j, owner) {
  const p = tabuleiroDados[i][j];
  return !!(p && p.owner === owner);
}

function contaPecasDoJogador(owner) {
  let n = 0;
  for (let i = 0; i < linhas; i++)
    for (let j = 0; j < colunas; j++)
      if (tabuleiroDados[i][j]?.owner === owner) n++;
  return n;
}

// lista de destinos possíveis para (i,j) com dado atual
function destinosPossiveis(i, j) {
  const peca = tabuleiroDados[i][j];
  if (!peca) return [];

  // 1) Dado tem de estar lançado
  if (valorDadoAtual === null) return [];

  // 2) Primeira vez que a peça mexe tem de ser com “1”
  if (!peca.moved && valorDadoAtual !== 1) return [];

  // 3) Calcular destino linear
  const startIdx = coordToIndex(i, j);
  const destIdx = startIdx + valorDadoAtual;

  if (destIdx >= pathOrder.length) {
    // Não se sai do tabuleiro; movimentos que “passariam” o fim são inválidos
    return [];
  }

  const { i: di, j: dj } = indexToCoord(destIdx);

  // 4) Restrições de casa de destino
  //    - não pode ter peça própria
  if (casaOcupadaPorAliado(di, dj, peca.owner)) return [];

  // 5) Regra "uma peça só pode entrar uma vez na última fila"
  // última fila = linhas-1 (índice 3 num 4xN)
  const vaiEntrarUltimaFila = (i !== linhas - 1) && (di === linhas - 1);
  if (vaiEntrarUltimaFila && peca.visitedLast) {
    return [];
  }

  // 6) Regra "a peça só se move na 4ª fila se não existirem peças suas na fila inicial"
  // Interpretamos “fila inicial” como a linha de onde as peças desse jogador começaram:
  // A começou em (linhas-1), B em (0). Assim, uma peça que ESTÁ na última fila (linhas-1)
  // só pode mover-se se a tua fila inicial estiver vazia.
  const estaNaUltimaFila = (i === linhas - 1);
  const filaInicialA = linhas - 1;
  const filaInicialB = 0;
  const filaInicialDoJogador = (peca.owner === "A") ? filaInicialA : filaInicialB;
  if (estaNaUltimaFila) {
    // se existir ALGUMA peça do jogador na fila inicial, esta peça não pode mover
    for (let x = 0; x < colunas; x++) {
      if (tabuleiroDados[filaInicialDoJogador][x]?.owner === peca.owner) {
        return [];
      }
    }
  }

  // Se passar por aqui, o destino é válido (ou captura ou casa vazia)
  return [{ i: di, j: dj }];
}

// =====================
// INTERAÇÃO: SELECIONAR / MOVER
// =====================
function selecionarCasa(i, j) {
  const valor = tabuleiroDados[i][j];

  // sem dado → não pode mover
  if (valorDadoAtual === null) {
    mensagemTexto.innerText = "🎲 Lança o dado antes de mover uma peça!";
    return;
  }

  // Sem seleção ainda
  if (!casaSelecionada) {
    if (valor && valor.owner === jogadorAtual) {
      casaSelecionada = { i, j };
      const destinos = destinosPossiveis(i, j);
      if (destinos.length === 0) {
        mensagemTexto.innerText = "❌ Essa peça não tem movimento válido com este valor.";
        destacarSelecao(i, j, []);
      } else {
        mensagemTexto.innerText = `Selecionaste uma peça em [${i}, ${j}]. Move ${valorDadoAtual} casas.`;
        destacarSelecao(i, j, destinos);
      }
    } else {
      mensagemTexto.innerText = "❌ Escolhe uma das tuas peças.";
    }
  } else {
    // Já existe seleção → tentar mover para (i,j)
    if (destinosValidosSelecionados.has(`${i},${j}`)) {
      moverPeca(casaSelecionada.i, casaSelecionada.j, i, j);
    } else {
      // Se clicou noutra peça sua, muda a seleção
      const alvo = tabuleiroDados[i][j];
      if (alvo && alvo.owner === jogadorAtual) {
        casaSelecionada = { i, j };
        const destinos = destinosPossiveis(i, j);
        if (destinos.length === 0) {
          mensagemTexto.innerText = "❌ Essa peça não tem movimento válido com este valor.";
          destacarSelecao(i, j, []);
        } else {
          destacarSelecao(i, j, destinos);
          mensagemTexto.innerText = `Peça [${i}, ${j}] selecionada. Destinos mostrados.`;
        }
      } else {
        mensagemTexto.innerText = "❌ Movimento inválido para essa casa.";
      }
    }
  }
}

function moverPeca(i1, j1, i2, j2) {
  const p1 = tabuleiroDados[i1][j1];
  if (!p1) return;

  // Validação final (defensiva)
  const destinos = destinosPossiveis(i1, j1);
  if (!destinos.some(({ i, j }) => i === i2 && j === j2)) {
    mensagemTexto.innerText = "❌ Movimento inválido.";
    return;
  }

  // Captura se houver adversário no destino
  const p2 = tabuleiroDados[i2][j2];
  if (p2 && p2.owner !== p1.owner) {
    // remove peça adversária
    tabuleiroDados[i2][j2] = null;
  }

  // Marcar “visitedLast” se entrou na última fila
  if (i2 === linhas - 1 && i1 !== linhas - 1) {
    p1.visitedLast = true;
  }

  // Executar movimento
  tabuleiroDados[i2][j2] = { ...p1, moved: true };
  tabuleiroDados[i1][j1] = null;

  desenharTabuleiro();
  mensagemTexto.innerText = `✅ Peça movida para [${i2}, ${j2}].`;
  casaSelecionada = null;

  // Verificar fim do jogo (um jogador ficou sem peças)
  const pecasA = contaPecasDoJogador("A");
  const pecasB = contaPecasDoJogador("B");
  if (pecasA === 0 || pecasB === 0) {
    const vencedor = pecasA > 0 ? "Jogador Azul (A)" : "Computador (B)";
    mensagemTexto.innerText = `🏁 Fim do jogo! Venceu: ${vencedor}`;
    valorDadoAtual = null;
    return;
  }

  // Turno: se 1, 4 ou 6 → repete; senão alterna
  const repete = [1, 4, 6].includes(valorDadoAtual);
  // consumir o dado
  const usado = valorDadoAtual;
  valorDadoAtual = null;
  resultadoDado.textContent = "Clique para lançar";

  if (repete) {
    mensagemTexto.innerText += ` Jogaste ${usado}. 🎉 Podes voltar a lançar.`;
    // Se for o computador e repete, vamos deixá-lo lançar e jogar de novo
    if (jogadorAtual === "B") {
      setTimeout(() => {
        lancarDado();
        setTimeout(jogadaComputador, 700);
      }, 600);
    }
  } else {
    alternarJogador();
  }
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
// ALTERNAR JOGADOR
// =====================
function alternarJogador() {
  jogadorAtual = (jogadorAtual === "A") ? "B" : "A";
  mensagemTexto.innerText += ` Agora é a vez do jogador ${jogadorAtual === "A" ? "azul" : "vermelho"}.`;

  if (jogadorAtual === "B") {
    // computador lança o dado e joga
    setTimeout(() => {
      if (valorDadoAtual === null) lancarDado();
      setTimeout(jogadaComputador, 600);
    }, 500);
  }
}

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
// JOGADAS VÁLIDAS (para IA)
// =====================
function obterJogadasValidas(jogador) {
  if (valorDadoAtual === null) return [];

  const jogadas = [];
  for (let i = 0; i < linhas; i++) {
    for (let j = 0; j < colunas; j++) {
      const p = tabuleiroDados[i][j];
      if (p?.owner !== jogador) continue;

      const destinos = destinosPossiveis(i, j);
      destinos.forEach(dest => {
        jogadas.push({
          origem: { linha: i, coluna: j },
          destino: { linha: dest.i, coluna: dest.j }
        });
      });
    }
  }
  return jogadas;
}

// =====================
// IA (jogada aleatória válida)
// =====================
function jogadaComputador() {
  if (jogadorAtual !== "B") return;

  const jogadasValidas = obterJogadasValidas("B");
  if (jogadasValidas.length === 0) {
    mensagemTexto.innerText = "🤖 O computador não tem jogadas válidas. Passa a vez.";
    // consumir o dado e alternar
    valorDadoAtual = null;
    resultadoDado.textContent = "Clique para lançar";
    alternarJogador();
    return;
  }

  // Priorizar capturas (se possível)
  const capturas = jogadasValidas.filter(j => {
    const { linha: i2, coluna: j2 } = j.destino;
    return tabuleiroDados[i2][j2] && tabuleiroDados[i2][j2].owner === "A";
  });
  const lista = capturas.length ? capturas : jogadasValidas;

  const jogada = lista[Math.floor(Math.random() * lista.length)];
  moverPeca(jogada.origem.linha, jogada.origem.coluna, jogada.destino.linha, jogada.destino.coluna);
  mensagemTexto.innerText = `🤖 O computador moveu de [${jogada.origem.linha}, ${jogada.origem.coluna}] para [${jogada.destino.linha}, ${jogada.destino.coluna}].`;
}
