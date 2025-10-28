// =====================
// VARIÁVEIS PRINCIPAIS
// =====================
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

// PAINÉIS
const painelInstrucoes = document.getElementById("instrucoes");
const painelClassificacoes = document.getElementById("classificacoes");
const botoesFechar = document.querySelectorAll(".btnFechar");

const btnVerInstrucoes = document.getElementById("btnVerInstrucoes");
const btnVerInstrucoes2 = document.getElementById("btnVerInstrucoes2");
const btnVerClassificacoes = document.getElementById("btnVerClassificacoes");
const btnVerClassificacoes2 = document.getElementById("btnVerClassificacoes2");


// =====================
//     ESTADO DO JOGO
// =====================
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



// setas do jogador AZUL (A) — exatamente a grelha que estás a desenhar
function getCellArrowsA(i, j) {
  if (i === 0) {
    if (j === 0) return ["↙"];
    if (j === colunas - 1) return ["↖"];
    return ["←"];
  }
  if (i === 1) {
    if (j === 0) return ["↘", "↗"];
    if (j === colunas - 1) return ["↗", "↘"];
    return ["→"];
  }
  if (i === 2) {
    if (j === 0) return ["↖"];
    if (j === colunas - 1) return ["↙", "↖"];
    return ["←"];
  }
  // i === 3
  if (j === colunas - 1) return ["↗"];
  return ["→"];
}

// mapeamento espelhado para o VERMELHO (B)
const mirrorMap = {
  "←": "→", "→": "←", "↑": "↑", "↓": "↓",
  "↖": "↗", "↗": "↖", "↘": "↙", "↙": "↘"
};

// devolve as setas aplicáveis ao "player" na célula (i,j)
function getCellArrows(i, j, player) {
  const base = getCellArrowsA(i, j);
  if (player === "A") return base;
  // espelhar para B
  return base.map(s => mirrorMap[s] || s);
}

// um passo a partir de (i,j) numa direção (para jogador A; B já vem espelhado)
function stepFrom(i, j, dir) {
  switch (dir) {
    case "←": return { i, j: j - 1 };
    case "→": return { i, j: j + 1 };
    case "↑": return { i: i - 1, j };
    case "↓": return { i: i + 1, j };
    case "↖": return { i: i - 1, j: j - 1 };
    case "↗": return { i: i - 1, j: j + 1 };
    case "↘": return { i: i + 1, j: j + 1 };
    case "↙": return { i: i + 1, j: j - 1 };
    default: return null;
  }
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



// =====================
//      INICIALIZAÇÃO
// =====================
window.addEventListener("DOMContentLoaded", () => {
  identificacao.classList.remove("oculto");
  configuracao.classList.add("oculto");
  comandos.classList.add("oculto");
  jogo.classList.add("oculto");
  comandosAntes.classList.remove("oculto");
  comandosDurante.classList.add("oculto");
});

btnLogin.addEventListener("click", () => {
  identificacao.classList.add("oculto");
  configuracao.classList.remove("oculto");
  comandos.classList.remove("oculto");
  comandosAntes.classList.remove("oculto");
  comandosDurante.classList.add("oculto");
  
});

// =====================
//         PAINÉIS
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

// =============================
// CLASSIFICAÇÕES (placeholder)
// =============================
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
//   TABULEIRO E PATH
// =====================
function construirPath(l, c) {
  pathOrder = [];
  indexMap = Array.from({ length: l }, () => Array(c).fill(0));
  for (let i = 0; i < l; i++) {
    if (i % 2 === 0) {
      for (let j = 0; j < c; j++) {
        indexMap[i][j] = pathOrder.length;
        pathOrder.push({ i, j });
      }
    } else {
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
//    GERAR TABULEIRO
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

// =====================
//  DESENHAR TABULEIRO
// =====================
function desenharTabuleiro(destinos = []) {
  gameGrid.innerHTML = "";
  destinosValidosSelecionados.clear();

  for (let i = 0; i < linhas; i++) {
    for (let j = 0; j < colunas; j++) {
      const casa = document.createElement("div");
      casa.classList.add("cell");
      casa.dataset.linha = i;
      casa.dataset.coluna = j;

      // --- SETAS (grelha do jogador azul) ---
      let simbolos = [];

      if (i === 0) {
        if (j === 0) simbolos = ["↙"];
        else if (j === colunas - 1) simbolos = ["↖"];
        else simbolos = ["←"];
      } else if (i === 1) {
        if (j === 0) simbolos = ["↘", "↗"];
        else if (j === colunas - 1) simbolos = ["↗", "↘"];
        else simbolos = ["→"];
      } else if (i === 2) {
        if (j === 0) simbolos = ["↖"];
        else if (j === colunas - 1) simbolos = ["↙", "↖"];
        else simbolos = ["←"];
      } else if (i === 3) {
        if (j === colunas - 1) simbolos = ["↗"];
        else simbolos = ["→"];
      }

      // adicionar todas as setas da célula
      if (simbolos.length === 1) {
        // uma única seta — centrada
        const seta = document.createElement("div");
        seta.classList.add("seta-fundo");
        seta.textContent = simbolos[0];
        casa.appendChild(seta);
      } else if (simbolos.length === 2) {
        // duas setas — empilhadas verticalmente
        const cont = document.createElement("div");
        cont.classList.add("seta-dupla");
        const seta1 = document.createElement("div");
        seta1.classList.add("seta-fundo", "seta1");
        seta1.textContent = simbolos[0];
        const seta2 = document.createElement("div");
        seta2.classList.add("seta-fundo", "seta2");
        seta2.textContent = simbolos[1];
        cont.appendChild(seta1);
        cont.appendChild(seta2);
        casa.appendChild(cont);
      }

      // desenhar peça
      const peca = tabuleiroDados[i][j];
      if (peca) {
        const circulo = document.createElement("div");
        circulo.classList.add("peca");
        circulo.style.background = peca.owner === "A" ? "royalblue" : "firebrick";
        circulo.style.opacity = "0.85";
        casa.appendChild(circulo);
      }

      // bolas transparentes de destino
      const destinoMarcado = destinos.find(d => d.i === i && d.j === j);
      if (destinoMarcado) {
        const alvo = document.createElement("div");
        alvo.classList.add("destino-transparente");
        casa.appendChild(alvo);
      }

      casa.addEventListener("click", () => selecionarCasa(i, j));
      
      gameGrid.appendChild(casa);
    }
  }
}

function destacarSelecao(i, j) {
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
}

// =====================
//     ESTADO INICIAL
// =====================
function inicializarTabuleiro(l, c) {
  tabuleiroDados = [];
  for (let i = 0; i < l; i++) {
    const linha = [];
    for (let j = 0; j < c; j++) {
      if (i === 0) linha.push({ owner: "B", moved: false });
      else if (i === l - 1) linha.push({ owner: "A", moved: false });
      else linha.push(null);
    }
    tabuleiroDados.push(linha);
  }
  jogadorAtual = "A";
  desenharTabuleiro();
}


// =====================
//      DADO DE PAUS
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

  if (!jogoIniciado && jogadorAtual === "A") {
    const algumaMovida = tabuleiroDados.flat().some(p => p?.owner === "A" && p.moved);
    if (!algumaMovida && valorDadoAtual !== 1) {
      mensagemTexto.innerText = "⚠️ O dado não deu 1. Ainda não podes começar.";
      mostrarBotaoPassarVez();
      return;
    } else {
      esconderBotaoPassarVez();
    }
  }
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
// MOVIMENTO E DESTINOS
// =====================
function destinosPossiveis(i, j) {
  const peca = tabuleiroDados[i][j];
  if (!peca || valorDadoAtual === null) return [];

  const passos = valorDadoAtual;
  const player = peca.owner;
  const destinos = [];

  function avancar(ci, cj, k, direcao, sentido) {
    if (k === passos) {
      destinos.push({ i: ci, j: cj });
      return;
    }

    // avança uma casa
    let ni = ci;
    let nj = cj + direcao;

    if (nj < 0 || nj >= colunas) {
      // chegou ao fim — muda de linha
      ni += sentido; // sobe (para azul) ou desce (para vermelho)
      if (ni < 0 || ni >= linhas) return; // saiu do tabuleiro
      direcao *= -1; // inverte a direção
      nj = Math.min(Math.max(nj, 0), colunas - 1);
    }

    // percorre recursivamente
    avancar(ni, nj, k + 1, direcao, sentido);
  }

  // parâmetros de movimento
  let direcao, sentido;
  if (player === "A") {
    // jogador azul: começa de baixo (linha 3) e sobe
    // linhas 3 e 1 → direita; linhas 2 e 0 → esquerda
    const direita = (i % 2 === 1);
    direcao = direita ? 1 : -1;
    sentido = -1; // sobe
  } else {
    // jogador vermelho: começa de cima (linha 0) e desce (espelho)
    const direita = (i % 2 === 0);
    direcao = direita ? 1 : -1;
    sentido = 1; // desce
  }

  avancar(i, j, 0, direcao, sentido);

  // Filtrar casas ocupadas por aliados
  const finais = destinos.filter(d => {
    const alvo = tabuleiroDados[d.i][d.j];
    return !(alvo && alvo.owner === player);
  });

  return finais;
}


function selecionarCasa(i, j) {
  const clicado = tabuleiroDados[i][j];

  // se não há dado → não pode mover
  if (valorDadoAtual === null) {
    mensagemTexto.innerText = "🎲 Lança o dado antes de mover!";
    return;
  }
  
  // Restrição: antes do jogo começar, só pode jogar com dado = 1
  /*if (!jogoIniciado && jogadorAtual === "A") {
    const algumaMovida = tabuleiroDados.flat().some(p => p?.owner === "A" && p.moved);
    if (!algumaMovida && valorDadoAtual !== 1) {
      mensagemTexto.innerText = "⚠️ O dado não deu 1. Ainda não podes começar.";
      mostrarBotaoPassarVez();
      return;
    } else {
      esconderBotaoPassarVez();
    }
  }*/


  // não há seleção ainda → escolher peça do jogador atual
  if (!casaSelecionada) {
    if (clicado && clicado.owner === jogadorAtual) {
      casaSelecionada = { i, j };
      const destinos = destinosPossiveis(i, j);
      if (destinos.length === 0) {
        mensagemTexto.innerText = "❌ Sem destinos válidos para este lançamento.";
        destacarSelecao(i, j);
        desenharTabuleiro([]); // limpa bolinhas
      } else {
        destacarSelecao(i, j);
        desenharTabuleiro(destinos); // mostra bolinhas
        // guardar set para clique em destino
        destinosValidosSelecionados = new Set(destinos.map(d => `${d.i},${d.j}`));
        mensagemTexto.innerText = `Selecionaste a peça em [${i}, ${j}]. Escolhe um destino.`;
      }
    } else {
      mensagemTexto.innerText = "❌ Escolhe uma das tuas peças.";
    }
    return;
  }

  // já havia peça selecionada → tentar mover
  const key = `${i},${j}`;
  if (destinosValidosSelecionados.has(key)) {
    moverPeca(casaSelecionada.i, casaSelecionada.j, i, j);
    casaSelecionada = null;
    destinosValidosSelecionados.clear();
    return;
  }

  // trocar seleção para outra peça tua (qualquer)
  if (clicado && clicado.owner === jogadorAtual) {
    casaSelecionada = { i, j };
    const destinos = destinosPossiveis(i, j);
    destacarSelecao(i, j);
    desenharTabuleiro(destinos);
    destinosValidosSelecionados = new Set(destinos.map(d => `${d.i},${d.j}`));
    mensagemTexto.innerText = `Peça em [${i}, ${j}] selecionada.`;
  } else {
    mensagemTexto.innerText = "❌ Não é um destino válido.";
  }
}


function mostrarBotaoPassarVez() {
  const container = document.getElementById("botaoPassarVezContainer");
  container.innerHTML = `<button id="btnPassarVez">Passar a vez</button>`;
  const btn = document.getElementById("btnPassarVez");
  btn.addEventListener("click", () => {
    container.innerHTML = ""; // remove o botão
    valorDadoAtual = null;
    resultadoDado.textContent = "Clique para lançar";
    alternarJogador();
  });
}

function esconderBotaoPassarVez() {
  const container = document.getElementById("botaoPassarVezContainer");
  container.innerHTML = "";
}


function moverPeca(i1, j1, i2, j2) {
  const p1 = tabuleiroDados[i1][j1];
  if (!p1) return;

  const player = p1.owner;
  const adversario = player === "A" ? "B" : "A";

  const destinos = destinosPossiveis(i1, j1);
  if (!destinos.some(({ i, j }) => i === i2 && j === j2)) {
    mensagemTexto.innerText = "❌ Movimento inválido.";
    desenharTabuleiro([]);
    return;
  }

  // Captura (ganha +1 ponto)
  const p2 = tabuleiroDados[i2][j2];
  if (p2 && p2.owner === adversario) {
    tabuleiroDados[i2][j2] = null;
    if (player === "A") pontuacaoA += 1;
    else pontuacaoB += 1;
  }

  // Mover
  tabuleiroDados[i2][j2] = { ...p1, moved: true };
  tabuleiroDados[i1][j1] = null;
  // Se foi o primeiro movimento válido do jogo → começa oficialmente
  if (!jogoIniciado) {
    jogoIniciado = true;
    mensagemTexto.innerText += " 🎯 O jogo começou oficialmente!";
  }
  

  // Peça chega à linha final do adversário → sai do tabuleiro (+2 pontos)
  const linhaFinal = player === "A" ? 0 : linhas - 1;
  if (i2 === linhaFinal) {
    tabuleiroDados[i2][j2] = null;
    if (player === "A") pontuacaoA += 2;
    else pontuacaoB += 2;
    mensagemTexto.innerText = `🚪 ${player === "A" ? "Azul" : "Vermelho"} marcou +2 pontos!`;
  } else {
    mensagemTexto.innerText = `✅ ${player === "A" ? "Azul" : "Vermelho"} moveu a peça.`;
  }

  // Atualizar e desenhar
  desenharTabuleiro([]);
  casaSelecionada = null;

  // Verificar fim do jogo
  const pecasA = contaPecasDoJogador("A");
  const pecasB = contaPecasDoJogador("B");
  if (pecasA === 0 || pecasB === 0) {
    let vencedor = "";
    if (pontuacaoA > pontuacaoB) vencedor = "🏆 Jogador Azul venceu!";
    else if (pontuacaoB > pontuacaoA) vencedor = "🏆 Computador venceu!";
    else vencedor = "🤝 Empate!";
    mensagemTexto.innerText = `${vencedor} (Azul: ${pontuacaoA} | Vermelho: ${pontuacaoB})`;
    valorDadoAtual = null;
    resultadoDado.textContent = "Clique para lançar";
    return;
  }

  // alternar turno (1,4,6 repetem)
  const usado = valorDadoAtual;
  const repete = [1, 4, 6].includes(usado);
  valorDadoAtual = null;
  resultadoDado.textContent = "Clique para lançar";

  if (repete) {
    mensagemTexto.innerText += ` Jogaste ${usado}. 🎉 Podes jogar novamente.`;
    if (jogadorAtual === "B") {
      setTimeout(() => { lancarDado(); setTimeout(jogadaComputador, 600); }, 500);
    }
  } else {
    alternarJogador();
  }
}


function alternarJogador() {
  jogadorAtual = (jogadorAtual === "A") ? "B" : "A";
  mensagemTexto.innerText += ` Agora é a vez do ${jogadorAtual === "A" ? "Jogador Azul" : "Computador (Vermelho)"}.`;

  if (jogadorAtual === "B") {
    // vez da IA: lança e joga
    setTimeout(() => {
      if (valorDadoAtual === null) lancarDado();
      setTimeout(jogadaComputador, 500);
    }, 450);
  }
}

// === IA: escolhe uma jogada válida aleatória (espelho via getCellArrows)
function jogadaComputador() {
  if (jogadorAtual !== "B") return;

  // Passo 1: lançar o dado de paus lentamente
  mensagemTexto.innerText = "🤖 O computador está a lançar o dado...";
  setTimeout(() => {
    // Lança o dado
    lancarDado();

    // Espera um pouco para mostrar o valor do dado
    setTimeout(() => {
      if (valorDadoAtual === null) return;

      // ============================================
      //    RESTRIÇÃO: PRIMEIRA JOGADA PRECISA DE 1
      // ============================================
      // Restrição: antes do jogo começar, só pode começar com dado = 1
      if (!jogoIniciado) {
        const algumaMovidaB = tabuleiroDados.flat().some(p => p?.owner === "B" && p.moved);
        if (!algumaMovidaB && valorDadoAtual !== 1) {
          mensagemTexto.innerText = "🤖 O computador não pode começar (não saiu 1). Passa a vez para ti.";
          valorDadoAtual = null;
          resultadoDado.textContent = "Clique para lançar";
          setTimeout(() => alternarJogador(), 1500);
          return;
        }
      }

      // ======================
      // GERAR JOGADAS VÁLIDAS
      // ======================
      const jogadas = [];

      for (let i = 0; i < linhas; i++) {
        for (let j = 0; j < colunas; j++) {
          const p = tabuleiroDados[i][j];
          if (p?.owner !== "B") continue;
          const dests = destinosPossiveis(i, j);
          for (const d of dests) {
            // não aterrar em aliado
            const alvo = tabuleiroDados[d.i][d.j];
            if (alvo && alvo.owner === "B") continue;
            jogadas.push({ oi: i, oj: j, di: d.i, dj: d.j });
          }
        }
      }

      if (jogadas.length === 0) {
        // sem jogadas → consumir dado e passar
        mensagemTexto.innerText = "🤖 O computador não tem jogadas válidas. Passa a vez.";
        const usado = valorDadoAtual;
        valorDadoAtual = null;
        resultadoDado.textContent = "Clique para lançar";
        const repete = [1, 4, 6].includes(usado);
        if (repete) {
          // repete mas não tem jogadas — simplesmente volta a lançar e tentar de novo
          setTimeout(() => {
            if (valorDadoAtual === null) lancarDado();
            setTimeout(jogadaComputador, 1000);
          }, 1000);
        } else {
          setTimeout(() => alternarJogador(), 2000);
        }
        return;
      }

      // ==================================
      //    ESCOLHER UMA JOGADA ALEATÓRIA
      // ==================================
      const pick = jogadas[Math.floor(Math.random() * jogadas.length)];

      mensagemTexto.innerText = `🤖 O computador escolheu mover a peça de [${pick.oi}, ${pick.oj}] para [${pick.di}, ${pick.dj}]...`;

      // pequena pausa antes do movimento para ser visível
      setTimeout(() => {
        moverPeca(pick.oi, pick.oj, pick.di, pick.dj);
      }, 2000); // espera 2s antes de mover

    }, 3000); // espera 3s entre lançar o dado e decidir a jogada

  }, 2000); // espera 2s antes de começar a lançar o dado
}


// =====================
//   INICIAR / DESISTIR
// =====================
btnIniciarJogo.addEventListener("click", () => {
  gerarTabuleiro();
  configuracao.classList.add("oculto");
  jogo.classList.remove("oculto");
  comandosAntes.classList.add("oculto");
  comandosDurante.classList.remove("oculto");
});

btnDesistir.addEventListener("click", () => {
  // voltar à configuração
  jogo.classList.add("oculto");
  configuracao.classList.remove("oculto");

  comandosDurante.classList.add("oculto");
  comandosAntes.classList.remove("oculto");

  document.getElementById("mensagemTexto").innerText = "Jogo terminado ou cancelado.";

  // === RESET DO DADO ===
  valorDadoAtual = null;
  resultadoDado.textContent = "Clique para lançar";
  paus.forEach(pau => pau.classList.remove("escuro")); // todos os paus voltam a claros
});



