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
let nivelAtualIA = "fácil";
let iaPecaAtual = null;


let dataInicioJogo = null;
let numeroJogo = 0;
let historicoJogos = JSON.parse(localStorage.getItem("historicoJogos") || "[]");

let modoJogoAtual = "computador";
let eventSource = null;





/**
* Calcula as setas de movimento base (perspetiva do jogador A) para a célula (i, j).
* @param {number} i - Índice da linha.
* @param {number} j - Índice da coluna.
* @returns {string[]} Lista de símbolos de setas aplicáveis à célula.
*/
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

/**
* Obtém as setas aplicáveis ao jogador na célula (i, j), espelhando para o jogador B.
* @param {number} i - Índice da linha.
* @param {number} j - Índice da coluna.
* @param {string} player - Identificador do jogador ("A" ou "B").
* @returns {string[]} Lista de símbolos de setas para a célula segundo o jogador.
*/
// devolve as setas aplicáveis ao "player" na célula (i,j)
function getCellArrows(i, j, player) {
  const base = getCellArrowsA(i, j);
  if (player === "A") return base;
  // espelhar para B
  return base.map(s => mirrorMap[s] || s);
}

/**
* Calcula a coordenada seguinte a partir de (i, j) seguindo uma direção.
* @param {number} i - Índice da linha atual.
* @param {number} j - Índice da coluna atual.
* @param {string} dir - Direção (↖, ↑, ↗, ←, →, ↙, ↓, ↘).
* @returns {{i:number, j:number} | null} Nova coordenada ou null se direção inválida.
*/
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

/**
* Verifica se uma coordenada (i, j) está dentro dos limites do tabuleiro.
* @param {number} i - Índice da linha.
* @param {number} j - Índice da coluna.
* @returns {boolean} Verdadeiro se estiver dentro; falso caso contrário.
*/
function dentro(i, j) {
  return i >= 0 && i < linhas && j >= 0 && j < colunas;
}

/**
* Indica se o jogo ainda não começou oficialmente.
* @returns {boolean} Verdadeiro se o jogo ainda não começou.
*/
function aindaNinguemComecou() {
  return !jogoIniciado;
}

/**
* Indica se é obrigatório tirar 1 para começar, enquanto o jogo não começou.
* @returns {boolean} Verdadeiro se a regra estiver ativa.
*/
function temDeSairUmParaComecar() {
  // Enquanto o jogo não começou, o jogador da vez só pode iniciar se sair 1
  return aindaNinguemComecou();
}

/**
* Determina se o início está bloqueado por não ter saído 1.
* @returns {boolean} Verdadeiro se o jogador tiver de passar a vez por não ter saído 1.
*/
function bloquearInicioSeNaoForUm() {
  if (temDeSairUmParaComecar() && valorDadoAtual !== 1) {
    return true; // TEM de passar a vez
  }
  return false;
}

/**
* Conta o número de peças de um jogador no tabuleiro.
* @param {string} owner - Identificador do jogador ("A" ou "B").
* @returns {number} Quantidade de peças do jogador.
*/
function contaPecasDoJogador(owner) {
  let n = 0;
  for (let i = 0; i < linhas; i++)
    for (let j = 0; j < colunas; j++)
      if (tabuleiroDados[i][j]?.owner === owner) n++;
  return n;
}

/**
* Verifica se todas as peças vivas de um jogador estão na sua última fila.
* @param {string} owner - Identificador do jogador ("A" ou "B").
* @returns {boolean} Verdadeiro se todas as peças desse jogador estiverem na última fila.
*/
function todasPecasNaUltimaLinha(owner) {
  const ultimaLinhaA = 0;
  const ultimaLinhaB = linhas - 1;

  let temPecas = false;

  for (let i = 0; i < linhas; i++) {
    for (let j = 0; j < colunas; j++) {
      const p = tabuleiroDados[i][j];
      if (!p || p.owner !== owner) continue;

      temPecas = true;

      if (owner === "A" && i !== ultimaLinhaA) return false;
      if (owner === "B" && i !== ultimaLinhaB) return false;
    }
  }

  return temPecas;
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

btnLogin.addEventListener("click", async () => {
    const nick = document.getElementById("user").value.trim();
    const password = document.getElementById("pass").value.trim();

    if (!nick || !password) {
        mensagemTexto.innerText = "⚠️ Preenche utilizador e senha!";
        return;
    }

    const result = await serverRegister(nick, password);

    if (result.error) {
        mensagemTexto.innerText = "❌ Erro: " + result.error;
        return;
    }

    // Sucesso — registo/validação feita
    identificacao.classList.add("oculto");
    configuracao.classList.remove("oculto");
    comandos.classList.remove("oculto");
    comandosAntes.classList.remove("oculto");
    comandosDurante.classList.add("oculto");

    mensagemTexto.innerText = "✔️ Autenticação feita com sucesso!";
});




// =====================
//         PAINÉIS
// =====================

/**
* Abre (mostra) um painel modal.
* @param {HTMLElement} painel - Elemento do painel a abrir.
* @returns {void}
*/
function abrirPainel(painel) {
  painel.classList.remove("oculto");
}

/**
* Fecha (esconde) os painéis de instruções e classificações.
* @returns {void}
*/
function fecharPainel() {
  painelInstrucoes.classList.add("oculto");
  painelClassificacoes.classList.add("oculto");
}

btnVerInstrucoes.addEventListener("click", () => abrirPainel(painelInstrucoes));
btnVerInstrucoes2.addEventListener("click", () => abrirPainel(painelInstrucoes));


btnVerClassificacoes.addEventListener("click", carregarRankingOnline);
btnVerClassificacoes2.addEventListener("click", carregarRankingOnline);
atualizarTabelaClassificacoes();


botoesFechar.forEach(btn => btn.addEventListener("click", fecharPainel));



// =============================
// CLASSIFICAÇÕES (placeholder)
// =============================

/**
* Regista o resultado de um jogo no histórico e ordena a tabela.
* @param {string} vencedor - Texto do vencedor.
* @param {string} resultadoTexto - Resultado formatado (ex.: "Azul: X | Vermelho: Y").
* @param {boolean} desistiu - Indica se ocorreu desistência.
* @returns {void}
*/
function registarResultado(vencedor, resultadoTexto, desistiu) {
  const jogoData = {
    jogo: numeroJogo,
    data: dataInicioJogo,
    nivelIA: nivelAtualIA.charAt(0).toUpperCase() + nivelAtualIA.slice(1),
    resultado: resultadoTexto,
    vencedor: vencedor
  };

  historicoJogos.push(jogoData);

  // === ORDENAR ===
  historicoJogos.sort((a, b) => {
    const pontosA = parseInt(a.resultado.match(/Azul:\s*(\d+)/)?.[1] || 0);
    const pontosB = parseInt(a.resultado.match(/Vermelho:\s*(\d+)/)?.[1] || 0);
    const difA = Math.abs(pontosA - pontosB);
    const difB = Math.abs(
      parseInt(b.resultado.match(/Azul:\s*(\d+)/)?.[1] || 0) -
      parseInt(b.resultado.match(/Vermelho:\s*(\d+)/)?.[1] || 0)
    );

    // Vitórias do jogador Azul primeiro (descendente por pontos)
    if (a.vencedor === "Jogador Azul" && b.vencedor !== "Jogador Azul") return -1;
    if (a.vencedor !== "Jogador Azul" && b.vencedor === "Jogador Azul") return 1;

    // Se ambos ganharam, ordenar por mais pontos do Azul
    if (a.vencedor === "Jogador Azul" && b.vencedor === "Jogador Azul") {
      return pontosB - pontosA;
    }

    // Se ambos perderam, ordenar por diferença crescente
    return difA - difB;
  });

  localStorage.setItem("historicoJogos", JSON.stringify(historicoJogos)); // Guardar no localStorage
  atualizarTabelaClassificacoes();
}

/**
* Atualiza a tabela de classificações no DOM com base no histórico.
* @returns {void}
*/
function atualizarTabelaClassificacoes() {
  const corpo = document.querySelector("#tabelaClassificacoes tbody");
  corpo.innerHTML = "";

  historicoJogos.forEach(j => {
    const linha = document.createElement("tr");
    linha.innerHTML = `
      <td>${j.jogo}</td>
      <td>${j.data}</td>
      <td>${j.nivelIA}</td>
      <td>${j.resultado}</td>
      <td>${j.vencedor}</td>
    `;
    corpo.appendChild(linha);
  });
}
// ======================
//   APAGAR HISTÓRICO
// ======================
document.addEventListener("click", (e) => { 
  if (e.target.id === "btnApagarHistorico") { 
    if (confirm("Tens a certeza que queres apagar todo o histórico de jogos?")) { 
      localStorage.removeItem("historicoJogos");
      historicoJogos = [];
      atualizarTabelaClassificacoes();
      alert("📛 Histórico apagado com sucesso!");
    }
  }
});


// =====================
//   TABULEIRO E PATH
// =====================

/**
* Constrói o percurso (path) serpenteado e o mapa de índices para a grelha.
* @param {number} l - Número de linhas.
* @param {number} c - Número de colunas.
* @returns {void}
*/
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

/**
* Converte coordenadas (i, j) no índice linear do path.
* @param {number} i - Índice da linha.
* @param {number} j - Índice da coluna.
* @returns {number} Índice linear correspondente.
*/
function coordToIndex(i, j) {
  return indexMap[i][j];
}

/**
* Converte um índice linear de path para coordenadas (i, j).
* @param {number} idx - Índice linear no path.
* @returns {{i:number, j:number}} Coordenadas equivalentes.
*/
function indexToCoord(idx) {
  return pathOrder[idx];
}

// =====================
//    GERAR TABULEIRO
// =====================

/**
* Gera o tabuleiro, valida o tamanho e inicializa a grelha e path.
* @returns {boolean} Verdadeiro se o tabuleiro foi gerado com sucesso.
*/
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

/**
* Desenha o tabuleiro e o estado atual das peças e destinos.
* @param {{i:number, j:number}[]} [destinos=[]] - Lista de destinos a destacar.
* @returns {void}
*/
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

/**
 * Atualiza o estado do tabuleiro no modo online,
 * com base nos dados enviados pelo servidor.
 * @param {object} data - Estado enviado pelo servidor.
 */
function atualizarEstadoDoJogoOnline(data) {

    // Atualizar jogador da vez
    jogadorAtual = (data.turn === document.getElementById("user").value.trim()) ? "A" : "B";

    // Atualizar valor do dado (se existir)
    if (data.dice !== undefined) {
        valorDadoAtual = data.dice;
        resultadoDado.textContent = `Resultado: ${valorDadoAtual}`;
    }

    // Atualizar tabuleiro
    if (data.board) {
        tabuleiroDados = data.board;  // o tabuleiro vem pronto do servidor
        desenharTabuleiro([]);
    }

    // Jogada extra (1,4,6)
    if (data.extra) {
        mensagemTexto.innerText = "🔁 Tens direito a nova jogada!";
    } else {
        mensagemTexto.innerText = "👉 É a tua vez!";
    }
}

/**
* Destaca visualmente a célula selecionada.
* @param {number} i - Índice da linha.
* @param {number} j - Índice da coluna.
* @returns {void}
*/
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

/**
* Inicializa o tabuleiro com peças nas filas iniciais e redesenha.
* @param {number} l - Número de linhas.
* @param {number} c - Número de colunas.
* @returns {void}
*/
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
  // Não tocar em jogadorAtual aqui — respeita a seleção feita antes
  desenharTabuleiro();
}

// =====================
//      DADO DE PAUS
// =====================

/**
* Lança o dado de paus, calcula o valor e gere regras de início.
* @returns {void}
*/
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
  mensagemTexto.innerHTML = `<strong>Saiu ${valorDadoAtual}</strong> — ${[1, 4, 6].includes(valorDadoAtual) ? "repete o turno se jogares." : "depois passa a vez."}`;


  // Início do Jogo
  if (!jogoIniciado) {
    const algumaMovida = tabuleiroDados.flat().some(p => p?.owner === jogadorAtual && p.moved);

    // ainda não há peça movida deste jogador
    if (!algumaMovida && valorDadoAtual !== 1) {
      if ([4, 6].includes(valorDadoAtual)) {
        // direito a novo lançamento
        mensagemTexto.innerText = `🎲 Saiu ${valorDadoAtual}. Ainda não podes começar, mas tens direito a novo lançamento!`;
        setTimeout(() => {
          valorDadoAtual = null;
          resultadoDado.textContent = "Clique para lançar";
          esconderBotaoPassarVez();
        }, 1000);

        return;
      } else {
        // 2 ou 3 → não pode jogar nem repetir
        mensagemTexto.innerText = "⚠️ O dado não deu 1. Ainda não podes começar. Passa a vez.";
        mostrarBotaoPassarVez();
        return;
      }
    } else {
      esconderBotaoPassarVez();
    }
  }


  // pequeno efeito visual
  dadoArea.style.transform = "scale(1.08)";
  setTimeout(() => dadoArea.style.transform = "scale(1)", 160);
}

// Clique no dado
dadoArea.addEventListener("click", async () => {

  // ============================
  //    MODO CONTRA COMPUTADOR
  // ============================
  if (modoJogoAtual === "computador") {

    if (valorDadoAtual !== null) {
      mensagemTexto.innerText = "Já tens um lançamento ativo. Usa-o antes de lançar de novo.";
      return;
    }

    lancarDado(); // lançamento local
    return;
  }

  // ============================
  //        MODO ONLINE
  // ============================
  const nick = document.getElementById("user").value.trim();
  const password = document.getElementById("pass").value.trim();

  if (!window.gameID) {
    mensagemTexto.innerText = "⚠️ Ainda não foi atribuído um jogo.";
    return;
  }

  mensagemTexto.innerText = "🎲 A pedir lançamento ao servidor...";

  const result = await serverRoll(nick, password, window.gameID);

  if (result.error) {
    mensagemTexto.innerText = "❌ Erro: " + result.error;
    return;
  }

  // Não mostramos resultado aqui! O servidor enviará via UPDATE
  mensagemTexto.innerText = "⏳ A aguardar resultado do servidor...";
});


// =====================
// MOVIMENTO E DESTINOS
// =====================

/**
* Calcula os destinos possíveis para a peça em (i, j), incluindo caminho alternativo.
* @param {number} i - Índice da linha da origem.
* @param {number} j - Índice da coluna da origem.
* @returns {{i:number, j:number}[]} Lista de destinos válidos.
*/
function destinosPossiveis(i, j) {
  const peca = tabuleiroDados[i][j];
  if (!peca || valorDadoAtual === null) return [];
  // === RESTRIÇÃO: não pode mover na 4ª fila se ainda tiver peças na fila inicial ===
  if (peca.owner === "A" && i === 0) {
    const temNaInicial = tabuleiroDados[linhas - 1].some(p => p?.owner === "A" && p !== peca);
    if (temNaInicial) {
      mensagemTexto.innerText = "🚫 Não podes mover peças na 4ª fila (linha 0) enquanto ainda tens peças na tua fila inicial (linha 3).";
      return [];
    }
  }

  if (peca.owner === "B" && i === linhas - 1) {
    const temNaInicial = tabuleiroDados[0].some(p => p?.owner === "B" && p !== peca);
    if (temNaInicial) {
      mensagemTexto.innerText = "🚫 O jogador vermelho não pode mover peças na 4ª fila (linha 3) enquanto ainda tem peças na sua fila inicial (linha 0).";
      return [];
    }
  }

  const passos = valorDadoAtual;
  const player = peca.owner;
  const destinos = [];

  // parâmetros de movimento (mesma lógica que tinhas)
  let direcao, sentido;
  if (player === "A") {
    const direita = (i % 2 === 1);
    direcao = direita ? 1 : -1;
    sentido = -1; // sobe
  } else {
    const direita = (i % 2 === 0);
    direcao = direita ? 1 : -1;
    sentido = 1; // desce
  }

  let ci = i, cj = j;
  let dir = direcao, sen = sentido;

  for (let k = 0; k < passos; k++) {
    let ni = ci;
    let nj = cj + dir;

    // passou da extremidade? muda de linha e inverte direção
    if (nj < 0 || nj >= colunas) {
      ni += sen;
      if (ni < 0 || ni >= linhas) return []; // saiu do tabuleiro
      dir *= -1;
      nj = Math.min(Math.max(nj, 0), colunas - 1);
    }

    // antes de avançar, verifica se há peça da mesma cor no caminho
    const alvo = tabuleiroDados[ni][nj];
    if (alvo && alvo.owner === player) {
      // BLOQUEIO: existe peça aliada no caminho → não pode passar
      return [];
    }

    // avança uma casa
    ci = ni;
    cj = nj;
  }

  // no fim do percurso, verifica se destino é válido (pode capturar inimigo)
  if (dentro(ci, cj)) {
    const destino = tabuleiroDados[ci][cj];
    if (!destino || destino.owner !== player) {
      destinos.push({ i: ci, j: cj });
    }
  }
  // ===========================
  // CAMINHO ALTERNATIVO (VOLTA)
  // ===========================

  /**
  * Simula um percurso com um determinado sentido vertical, retornando destino válido.
  * @param {number} iniI - Linha inicial.
  * @param {number} iniJ - Coluna inicial.
  * @param {number} dirInicial - Direção horizontal inicial (+1 ou -1).
  * @param {number} senInicial - Sentido vertical inicial (+1 desce, -1 sobe).
  * @param {number} passosSim - Número de passos a simular.
  * @returns {{i:number, j:number} | null} Destino válido ou null se bloqueado/fora.
  */
  // helper local para simular a mesma lógica de percurso mas com 'sen' escolhido
  function simularDestinoComSentido(iniI, iniJ, dirInicial, senInicial, passosSim) {
    let sci = iniI, scj = iniJ;
    let sdir = dirInicial, ssen = senInicial;

    for (let kk = 0; kk < passosSim; kk++) {
      let sni = sci;
      let snj = scj + sdir;

      // muda de linha ao bater na extremidade
      if (snj < 0 || snj >= colunas) {
        sni += ssen;
        if (sni < 0 || sni >= linhas) return null; // saiu do tabuleiro
        sdir *= -1;
        snj = Math.min(Math.max(snj, 0), colunas - 1);
      }

      // BLOQUEIO por peça aliada
      const alvoAlt = tabuleiroDados[sni][snj];
      if (alvoAlt && alvoAlt.owner === player) return null;

      // avança
      sci = sni;
      scj = snj;
    }

    // destino final válido (vazio ou inimigo)
    const destinoAlt = tabuleiroDados[sci][scj];
    if (!destinoAlt || destinoAlt.owner !== player) {
      return { i: sci, j: scj };
    }
    return null;
  }

  // Apenas criamos o destino alternativo nas linhas pedidas:
  // A em linha 1 → pode "voltar" (descer) para 2
  // B em linha 2 → pode "voltar" (subir) para 1
  // Caminho alternativo: a partir da última fila, permitir voltar à fila anterior
  let destinoAlternativo = null;
  if (player === "A" && i === 0) {
    // Azul na última fila pode "descer" para a anterior
    destinoAlternativo = simularDestinoComSentido(i, j, direcao, +1, passos);
  } else if (player === "B" && i === (linhas - 1)) {
    // Vermelho na última fila pode "subir" para a anterior
    destinoAlternativo = simularDestinoComSentido(i, j, direcao, -1, passos);
  }
  

  // se obtivemos um destino alternativo válido e diferente do normal, adiciona
  if (destinoAlternativo) {
    const jaExiste = destinos.some(d => d.i === destinoAlternativo.i && d.j === destinoAlternativo.j);
    if (!jaExiste) destinos.push(destinoAlternativo);
  }

  return destinos;
}

/**
* Trata a seleção de células e o fluxo de movimento do jogador.
* @param {number} i - Índice da linha clicada.
* @param {number} j - Índice da coluna clicada.
* @returns {void}
*/
function selecionarCasa(i, j) {
  const clicado = tabuleiroDados[i][j];

  // se não há dado → não pode mover
  if (valorDadoAtual === null) {
    mensagemTexto.innerText = "🎲 Lança o dado antes de mover!";
    return;
  }
  


  // Bloqueio: antes do jogo começar, só pode mover com 1
  if (bloquearInicioSeNaoForUm()) {
    if (jogadorAtual === "A") {
      mensagemTexto.innerText = "⚠️ Para arrancar o jogo tens de tirar 1 (Tâb).";
      mostrarBotaoPassarVez();
    } else {
      mensagemTexto.innerText = "🤖 O computador ainda não pode começar (faltou 1).";
    }
    return;
  }


  
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
    if (modoJogoAtual === "computador") {
      // comportamento antigo: tudo local
      moverPeca(casaSelecionada.i, casaSelecionada.j, i, j);
    } else if (modoJogoAtual === "online") {
      // novo comportamento: notificar servidor
      enviarJogadaOnline(casaSelecionada.i, casaSelecionada.j, i, j);
    }

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

/**
 * Envia uma jogada ao servidor no modo online.
 * @param {number} i1 - Linha de origem.
 * @param {number} j1 - Coluna de origem.
 * @param {number} i2 - Linha de destino.
 * @param {number} j2 - Coluna de destino.
 * @returns {Promise<void>}
 */
async function enviarJogadaOnline(i1, j1, i2, j2) {
  const nick = document.getElementById("user").value.trim();
  const password = document.getElementById("pass").value.trim();

  if (!window.gameID) {
    mensagemTexto.innerText = "⚠️ Ainda não tens um jogo associado.";
    return;
  }

  // 🔹 FORMATO PROVISÓRIO DO MOVE
  // Quando o enunciado disser exatamente qual é o formato,
  // só precisas de mudar ESTA variável.
  const move = {
    from: { row: i1, col: j1 },
    to:   { row: i2, col: j2 }
  };

  mensagemTexto.innerText = "📨 A enviar jogada ao servidor...";

  const result = await serverNotify(nick, password, window.gameID, move);

  if (result.error) {
    mensagemTexto.innerText = "❌ Erro na jogada: " + result.error;
    return;
  }

  // O efeito real da jogada (mover peças, capturas, fim de jogo, etc.)
  // virá mais tarde por 'update' do servidor.
  mensagemTexto.innerText = "⏳ Jogada enviada. A aguardar resposta do servidor...";
}

/**
* Mostra o botão “Passar a vez” e define o seu comportamento.
* @returns {void}
*/

function mostrarBotaoPassarVez() {
  const container = document.getElementById("botaoPassarVezContainer");
  container.innerHTML = `<button id="btnPassarVez">Passar a vez</button>`;

  const btn = document.getElementById("btnPassarVez");

  btn.addEventListener("click", async () => {

    // ===================================
    //      MODO CONTRA O COMPUTADOR
    // ===================================
    if (modoJogoAtual === "computador") {
      container.innerHTML = "";
      valorDadoAtual = null;
      resultadoDado.textContent = "Clique para lançar";
      alternarJogador();
      return;
    }

    // ===================================
    //             MODO ONLINE
    // ===================================
    const nick = document.getElementById("user").value.trim();
    const password = document.getElementById("pass").value.trim();

    if (!window.gameID) {
      mensagemTexto.innerText = "⚠️ Erro: jogo não definido.";
      return;
    }

    mensagemTexto.innerText = "📨 A pedir ao servidor para passar a vez...";

    const result = await serverPass(nick, password, window.gameID);

    if (result.error) {
      mensagemTexto.innerText = "❌ Erro: " + result.error;
      return;
    }

    // Nada muda localmente — aguardamos o UPDATE do servidor
    mensagemTexto.innerText = "⏳ A aguardar confirmação do servidor...";
  });
}



/**
* Esconde o botão “Passar a vez”.
* @returns {void}
*/
function esconderBotaoPassarVez() {
  const container = document.getElementById("botaoPassarVezContainer");
  container.innerHTML = "";
}

/**
* Mostra o pop-up de fim de jogo com vencedor e pontuação.
* @param {string} vencedor - Texto do vencedor.
* @param {string} pontuacao - Texto da pontuação final.
* @returns {void}
*/
function mostrarPopupFimJogo(vencedor, pontuacao) {
  const popup = document.getElementById("popupFimJogo");
  const titulo = document.getElementById("popupTitulo");
  const pontos = document.getElementById("popupPontuacao");

  titulo.textContent = `🏆 Venceu o ${vencedor}!`;
  pontos.textContent = `Peças no Tabuleiro — ${pontuacao}`;
  popup.classList.add("mostrar");
}

/**
* Esconde o pop-up de fim de jogo.
* @returns {void}
*/
function esconderPopupFimJogo() {
  const popup = document.getElementById("popupFimJogo");
  popup.classList.remove("mostrar");
}

/**
* Executa a movimentação de uma peça de (i1, j1) para (i2, j2) aplicando regras.
* @param {number} i1 - Linha de origem.
* @param {number} j1 - Coluna de origem.
* @param {number} i2 - Linha de destino.
* @param {number} j2 - Coluna de destino.
* @returns {void}
*/
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


  // Mover
  tabuleiroDados[i2][j2] = { ...p1, moved: true };
  tabuleiroDados[i1][j1] = null;
  // Se foi o primeiro movimento válido do jogo → começa oficialmente
  if (!jogoIniciado) {
    jogoIniciado = true;
    esconderBotaoPassarVez();
    mensagemTexto.innerText += " 🎯 O jogo começou oficialmente!";
  }


  mensagemTexto.innerText = `✅ ${player === "A" ? "Azul" : "Vermelho"} moveu a peça.`;

  // Atualizar e desenhar
  desenharTabuleiro([]);
  casaSelecionada = null;

  // Verificar fim do jogo: todas as peças de um jogador na última fila
  const fimA = todasPecasNaUltimaLinha("A");
  const fimB = todasPecasNaUltimaLinha("B");

  if (fimA || fimB) {
    const pecasA = contaPecasDoJogador("A");
    const pecasB = contaPecasDoJogador("B");

    let vencedor = "";
    if (pecasA > pecasB) vencedor = "Jogador Azul";
    else if (pecasB > pecasA) vencedor = "Computador";
    else vencedor = "Empate";

    // Guardar estes valores para mostrar nas classificações/pop-up
    pontuacaoA = pecasA;
    pontuacaoB = pecasB;

    const resultadoTexto = `Azul: ${pontuacaoA} | Vermelho: ${pontuacaoB}`;
    mensagemTexto.innerText = `🏁 Fim do Jogo! ${vencedor} venceu. (${resultadoTexto})`;

    registarResultado(vencedor, resultadoTexto, false);
    mostrarPopupFimJogo(vencedor, resultadoTexto);

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
    mensagemTexto.innerText += ` Jogaste ${usado}. Podes voltar a lançar.`; 
    esconderBotaoPassarVez();
    if (jogadorAtual === "B") {
      setTimeout(() => { jogadaComputador(); }, 500); 
    }
  } else {
    alternarJogador(); 
  }
}

/**
* Alterna o jogador atual e dispara a jogada da IA quando aplicável.
* @returns {void}
*/
function alternarJogador() {
  jogadorAtual = (jogadorAtual === "A") ? "B" : "A";
  mensagemTexto.innerText += ` Agora é a vez do ${jogadorAtual === "A" ? "Jogador Azul" : "Computador (Vermelho)"}.`;

  if (jogadorAtual === "B") {
    // vez da IA: lança e joga
    setTimeout(() => {
      jogadaComputador();
    }, 450);
  }
}

/**
* Executa o turno do computador: lança, decide e move consoante o nível.
* @returns {void}
*/
// IA: escolhe uma jogada válida aleatória (espelho via getCellArrows)
function jogadaComputador() {
  if (jogadorAtual !== "B") return;

  // Se o jogo ainda não começou, a IA só pode jogar com 1. Este bloco já é coberto em lancarDado()
  // mas reforçamos aqui para não tentar gerar jogadas quando não pode.
  if (aindaNinguemComecou() && valorDadoAtual !== null && valorDadoAtual !== 1) {
    mensagemTexto.innerText = "🤖 Ainda não saiu 1. O computador passa a vez.";
    //const usado = valorDadoAtual;
    valorDadoAtual = null;
    resultadoDado.textContent = "Clique para lançar";
    setTimeout(() => alternarJogador(), 800);
    return;
  }

  // Passo 1: lançar o dado de paus lentamente
  mensagemTexto.innerText = "🤖 O computador está a lançar o dado...";
  setTimeout(() => {
    // Lança o dado
    lancarDado();
    esconderBotaoPassarVez();

    // Gate: antes do jogo começar (IA) 
    if (!jogoIniciado) {
      const algumaMovidaB = tabuleiroDados.flat().some(p => p?.owner === "B" && p.moved);

      if (!algumaMovidaB && valorDadoAtual !== 1) {

        if ([4, 6].includes(valorDadoAtual)) {
          mensagemTexto.innerText = `🤖 Saiu ${valorDadoAtual}. O computador ainda não pode começar, mas vai lançar novamente.`;
          setTimeout(() => {
            valorDadoAtual = null;
            resultadoDado.textContent = "Clique para lançar";
            esconderBotaoPassarVez();
          }, 1000);


          setTimeout(() => {
            lancarDado();
            setTimeout(jogadaComputador, 1000);
          }, 1000);
          return;

        } else if ([2, 3].includes(valorDadoAtual)) {
          mensagemTexto.innerText = "🤖 Não saiu 1. O computador passa a vez.";
          setTimeout(() => {
            valorDadoAtual = null;
            resultadoDado.textContent = "Clique para lançar";
            esconderBotaoPassarVez();
          }, 1000);

          setTimeout(() => alternarJogador(), 1000);
          return;
        }
      }
    }


    // Espera um pouco para mostrar o valor do dado
    setTimeout(() => {
      if (valorDadoAtual === null) return;

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

      // ===========================================================
      //           ESCOLHER JOGADA CONFORME NÍVEL DA IA
      // ===========================================================
      let pick = null;

      // Conjuntos úteis
      const jogadasCaptura = jogadas.filter(({ di, dj }) => {
        const alvo = tabuleiroDados[di][dj];
        return alvo && alvo.owner === "A"; // aterra em peça azul → captura
      });

      const jogadasFinal = jogadas.filter(({ di }) => di === (linhas - 1)); // última linha do vermelho

      if (nivelAtualIA === "fácil") {
        // FÁCIL: sempre aleatório
        pick = jogadas[Math.floor(Math.random() * jogadas.length)];
        mensagemTexto.innerText = "🤖 [FÁCIL] Movimento aleatório.";
      }

      else if (nivelAtualIA === "médio") {
        // MÉDIO: captura se possível; senão, aleatório
        if (jogadasCaptura.length > 0) {
          pick = jogadasCaptura[Math.floor(Math.random() * jogadasCaptura.length)];
          mensagemTexto.innerText = "🤖 [MÉDIO] Captura disponível — a aproveitar (1 ponto).";
        } else {
          pick = jogadas[Math.floor(Math.random() * jogadas.length)];
          mensagemTexto.innerText = "🤖 [MÉDIO] Sem captura: movimento aleatório.";
        }
      }

      else if (nivelAtualIA === "difícil") {
        // DIFÍCIL: 1) chegar à última linha (2 pts), 2) capturar (1 pt), 3) aleatório
        if (jogadasFinal.length > 0) {
          pick = jogadasFinal[Math.floor(Math.random() * jogadasFinal.length)];
          mensagemTexto.innerText = "🤖 [DIFÍCIL] Prioridade máxima: chegar à última linha (2 pontos).";
        } else if (jogadasCaptura.length > 0) {
          pick = jogadasCaptura[Math.floor(Math.random() * jogadasCaptura.length)];
          mensagemTexto.innerText = "🤖 [DIFÍCIL] Sem chegada imediata: captura (1 ponto).";
        } else {
          pick = jogadas[Math.floor(Math.random() * jogadas.length)];
          mensagemTexto.innerText = "🤖 [DIFÍCIL] Sem final/captura: movimento aleatório.";
        }
      }


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

btnIniciarJogo.addEventListener("click", async () => {
  const selects = configuracao.querySelectorAll("select");
  const modo = selects[1].value; // modo de jogo

  // ================================
  //       MODO CONTRA O COMPUTADOR
  // ================================
  if (modo.includes("Computador")) {

    modoJogoAtual = "computador";

    const primeiroSel = selects[2]; // quem joga primeiro
    const nivelSelecionado = selects[3].value.toLowerCase(); // fácil, médio, difícil

    // Guardar o nível escolhido globalmente
    nivelAtualIA = nivelSelecionado;

    const primeiro = (primeiroSel.value || "").toLowerCase();
    jogadorAtual = (primeiro.includes("computador")) ? "B" : "A";

    // gerar tabuleiro localmente
    const ok = gerarTabuleiro();
    if (!ok) {
      // por ex., se o número de colunas for inválido
      return;
    }

    // Registar data e hora do início do jogo (modo local)
    dataInicioJogo = new Date().toLocaleString("pt-PT");
    numeroJogo = historicoJogos.length + 1;

    // Mensagem inicial
    mensagemTexto.innerText =
      `Jogo iniciado no modo ${nivelAtualIA.toUpperCase()}! ` +
      `${jogadorAtual === "A" ? "Começas tu." : "O computador começa."}`;

    // Lógica para quem começa
    if (jogadorAtual === "B") {
      // Espera meio segundo e a IA começa automaticamente
      setTimeout(() => {
        jogadaComputador();
      }, 600);
    } else {
      // É o jogador: mostra claramente que pode lançar
      mensagemTexto.innerText += " 🎲 Clica no dado para começar!";
    }

    // mostrar secções corretas
    configuracao.classList.add("oculto");
    comandosAntes.classList.add("oculto");
    comandosDurante.classList.remove("oculto");
    jogo.classList.remove("oculto");

    return; // IMPORTANTÍSSIMO: não cair no modo online
  }

  // ================================
  //      MODO ONLINE (JOGADOR)
  // ================================

  modoJogoAtual = "online";

  const nick = document.getElementById("user").value.trim();
  const password = document.getElementById("pass").value.trim();
  const group = "61"; // altera para o teu grupo
  const tamanho = parseInt(selects[0].value.match(/\d+/g)[1]);

  const result = await serverJoin(group, nick, password, tamanho);

  if (result.error) {
    mensagemTexto.innerText = "❌ Erro: " + result.error;
    return;
  }

  // guardar id do jogo
  window.gameID = result.game;
  mensagemTexto.innerText = "⏳ A aguardar adversário...";

  iniciarUpdate(nick, window.gameId);


  configuracao.classList.add("oculto");
  comandosAntes.classList.add("oculto");
  comandosDurante.classList.remove("oculto");
  jogo.classList.remove("oculto");
});



btnDesistir.addEventListener("click", async () => {
  // voltar à configuração / ecrãs comuns
  jogo.classList.add("oculto");
  configuracao.classList.remove("oculto");
  comandosDurante.classList.add("oculto");
  comandosAntes.classList.remove("oculto");

  // RESET DO DADO
  valorDadoAtual = null;
  resultadoDado.textContent = "Clique para lançar";
  paus.forEach(pau => pau.classList.remove("escuro"));

  if (modoJogoAtual === "computador") {
    // ==========================
    //    MODO CONTRA COMPUTADOR
    // ==========================
    document.getElementById("mensagemTexto").innerText = "Jogo terminado ou cancelado.";
    const vencedor = "Jogador Vermelho";
    const resultadoTexto = `Azul: ${pontuacaoA} | Vermelho: ${pontuacaoB} (Desistência)`;
    registarResultado(vencedor, resultadoTexto, true);
  } else if (modoJogoAtual === "online") {
    // ==========================
    //      MODO ONLINE
    // ==========================
    const nick = document.getElementById("user").value.trim();
    const password = document.getElementById("pass").value.trim();

    if (window.gameID) {
      try {
        const result = await serverLeave(nick, password, window.gameID);
        if (result.error) {
          console.warn("Erro em leave:", result.error);
        }
      } catch (e) {
        console.error("Falha ao contactar o servidor leave:", e);
      }
    }

    document.getElementById("mensagemTexto").innerText =
      "Saíste do jogo online. A vitória é atribuída ao adversário.";
  }
});




document.getElementById("btnVoltarInicio").addEventListener("click", () => {
  esconderPopupFimJogo(); 

  // Voltar ao menu principal
  jogo.classList.add("oculto");
  configuracao.classList.remove("oculto");
  comandosDurante.classList.add("oculto");
  comandosAntes.classList.remove("oculto");

  // Reset das variáveis principais
  jogoIniciado = false;
  pontuacaoA = 0;
  pontuacaoB = 0;
  valorDadoAtual = null;
  resultadoDado.textContent = "Clique para lançar";
  paus.forEach(pau => pau.classList.remove("escuro"));
  mensagemTexto.innerText = "Novo jogo pronto a iniciar!";
});



// =====================
//   2 ENTREGA
// =====================
/**
 * Regista um jogador no servidor ou valida password se já existir.
 * @param {string} nick - Nome do jogador.
 * @param {string} password - Password escolhida.
 * @returns {Promise<object>} Resposta do servidor (error ou sucesso).
 */
async function serverRegister(nick, password) {
    const response = await fetch("http://twserver.alunos.dcc.fc.up.pt:8008/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nick, password })
    });

    return response.json(); // pode conter {} ou {error:"..."}
}

/**
 * Pede ao servidor para entrar num jogo com a dimensão indicada.
 * @param {string} group - Identificador do grupo.
 * @param {string} nick - Nome do jogador.
 * @param {string} password - Password do jogador.
 * @param {number} size - Número de colunas do tabuleiro.
 * @returns {Promise<object>} Resposta do servidor (game ou error)
 */
async function serverJoin(group, nick, password, size) {
    const response = await fetch("http://twserver.alunos.dcc.fc.up.pt:8008/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ group, nick, password, size })
    });

    return response.json(); // { game: "ID" } ou { error:"..." }
}

/**
 * Envia ao servidor o pedido para abandonar um jogo.
 * @param {string} nick - Identificador do jogador.
 * @param {string} password - Password do jogador.
 * @param {string} game - Identificador do jogo.
 * @returns {Promise<object>} Resposta do servidor (pode conter error).
 */
async function serverLeave(nick, password, game) {
  const response = await fetch("http://twserver.alunos.dcc.fc.up.pt:8008/leave", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ nick, password, game })
  });

  return response.json();
}

/**
 * Pede ao servidor para lançar o dado de paus.
 * @param {string} nick - Nome do jogador.
 * @param {string} password - Password do jogador.
 * @param {string} game - Identificador do jogo.
 * @returns {Promise<object>} Resposta do servidor (normalmente { "ok": true } ou erro)
 */
async function serverRoll(nick, password, game) {
    const response = await fetch("http://twserver.alunos.dcc.fc.up.pt:8008/roll", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nick, password, game })
    });

    return response.json(); // pode ser { ok:true } ou { error:"..." }
}

/**
 * Notifica o servidor de uma jogada (movimento no tabuleiro).
 * @param {string} nick - Identificador do jogador.
 * @param {string} password - Password do jogador.
 * @param {string} game - Identificador do jogo.
 * @param {any} move - Representação da jogada (formato definido pelo enunciado/servidor).
 * @returns {Promise<object>} Resposta do servidor (pode conter error).
 */
async function serverNotify(nick, password, game, move) {
  const response = await fetch("http://twserver.alunos.dcc.fc.up.pt:8008/notify", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ nick, password, game, move })
  });

  return response.json(); // normalmente vazio ou { error: "..." }
}


/**
 * Pede ao servidor para passar a vez.
 * @param {string} nick - Identificador do jogador.
 * @param {string} password - Password do jogador.
 * @param {string} game - Identificador do jogo.
 * @returns {Promise<object>} Resposta do servidor (pode ter error)
 */
async function serverPass(nick, password, game) {
    const response = await fetch("http://twserver.alunos.dcc.fc.up.pt:8008/pass", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nick, password, game })
    });

    return response.json(); // { error: "..."} ou {}
}

/**
 * Abre a ligação SSE (Server-Sent Events) ao servidor.
 * Recebe eventos de atualização do jogo.
 * @param {string} nick - Identificador do jogador.
 * @param {string} game - ID do jogo.
 */
function iniciarUpdate(nick, game) {

    // Fechar ligação anterior se existir
    if (eventSource) {
        eventSource.close();
        eventSource = null;
    }

    const url = `http://twserver.alunos.dcc.fc.up.pt:8008/update?nick=${encodeURIComponent(nick)}&game=${encodeURIComponent(game)}`;

    eventSource = new EventSource(url);

    mensagemTexto.innerText = " Ligação ao servidor iniciada. À espera de eventos...";

    // ========================
    // EVENTO DE ERRO
    // ========================
    eventSource.onerror = () => {
        mensagemTexto.innerText = "⚠️ Erro na ligação ao servidor (update).";
        eventSource.close();
    };

    // ========================
    // EVENTO: start
    // ========================
    eventSource.addEventListener("start", (e) => {
        const data = JSON.parse(e.data);

        mensagemTexto.innerText = "🟢 Jogo online começou!";

        // o servidor indica quem começa
        jogadorAtual = data.turn === nick ? "A" : "B";

        // o servidor envia o tamanho
        linhas = 4;
        colunas = data.size;

        // gerar tabuleiro (vazio para o início do modo online)
        gerarTabuleiro();
    });

    // ========================
    // EVENTO: state
    // ========================
    eventSource.addEventListener("state", (e) => {
        const data = JSON.parse(e.data);

        // data contém:
        // - board: tabuleiro
        // - turn: quem joga agora
        // - dice: valor do dado (se aplicável)
        // - move: última jogada (se houve)
        // - captured: se capturou peça
        // - extra: se repete jogada

        atualizarEstadoDoJogoOnline(data);
    });

    // ========================
    // EVENTO: end
    // ========================
    eventSource.addEventListener("end", (e) => {
        const data = JSON.parse(e.data);

        mensagemTexto.innerText = `🏁 Jogo terminou. Vencedor: ${data.winner}`;

        // fechar ligações
        if (eventSource) eventSource.close();
        eventSource = null;
    });
}

/**
 * Pede ao servidor a tabela de ranking (top 10).
 * @param {string} group - Identificador do grupo.
 * @param {number} size - Tamanho do tabuleiro.
 * @returns {Promise<object>} Ranking ou erro.
 */
async function serverRanking(group, size) {
    const response = await fetch("http://twserver.alunos.dcc.fc.up.pt:8008/ranking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ group, size })
    });

    return response.json(); // { ranking:[ { nick, victories }, ... ] } ou { error:"..." }
}

async function carregarRankingOnline() {
    abrirPainel(painelClassificacoes);

    const group = "61"; // o teu grupo
    const sizeSelect = configuracao.querySelectorAll("select")[0];
    const size = parseInt(sizeSelect.value.match(/\d+/g)[1]); // número de colunas

    const result = await serverRanking(group, size);

    const corpo = document.querySelector("#tabelaClassificacoes tbody");
    corpo.innerHTML = "";

    if (result.error) {
        corpo.innerHTML = `<tr><td colspan="2">❌ Erro: ${result.error}</td></tr>`;
        return;
    }

    // estrutura do servidor: [{nick:"...", victories:X}, ...]
    result.ranking.forEach(player => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td>${player.nick}</td>
            <td>${player.victories}</td>
        `;
        corpo.appendChild(tr);
    });
}

