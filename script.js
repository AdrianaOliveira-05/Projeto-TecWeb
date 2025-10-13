
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

// =====================
// CLASSIFICAÇÕES (Gestão futura)
// =====================

// Função para adicionar resultados à tabela
function adicionarResultado(nome, data, dificuldade, tempo, resultado) {
  const tabela = document.querySelector("#tabelaClassificacoes tbody");
  const novaLinha = document.createElement("tr");

  const posicao = tabela.rows.length + 1;
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

// Exemplo de teste — podes apagar depois
// adicionarResultado("Daniela", "07/10/2025", "Fácil", "02:58", "Vitória");

// Botão para limpar classificações
const btnLimparClassificacoes = document.getElementById("btnLimparClassificacoes");
if (btnLimparClassificacoes) {
  btnLimparClassificacoes.addEventListener("click", () => {
    const tbody = document.querySelector("#tabelaClassificacoes tbody");
    tbody.innerHTML = "";
  });
}
botoesFechar.forEach(btn => btn.addEventListener("click", fecharPainel));



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
    mensagemTexto.innerText ="⚠️ O número de colunas deve ser ímpar. Escolhe outro tamanho!";
    return false;
  }
  inicializarTabuleiro(linhas, colunas);

  // Limpar mensagens anteriores
  document.getElementById("mensagemTexto").innerText = "Jogo iniciado! Boa sorte!";

  // Criar grid 
  gameGrid.style.gridTemplateColumns = `repeat(${colunas}, 40px)`;
  return true;
}
function desenharTabuleiro() {
  gameGrid.innerHTML = "";

  for (let i = 0; i < tabuleiroDados.length; i++) {
    for (let j = 0; j < tabuleiroDados[i].length; j++) {
      const casa = document.createElement("div");
      casa.classList.add("cell");
      casa.dataset.linha = i;
      casa.dataset.coluna = j;

      const valor = tabuleiroDados[i][j];
      if (valor === "A") {
        casa.style.background = "royalblue";
      } else if (valor === "B") {
        casa.style.background = "firebrick";
      }

      // clicar numa casa
      casa.addEventListener("click", () => selecionarCasa(i, j));
      gameGrid.appendChild(casa);
    }
  }
}

// =====================
// PEÇAS E CASAS DO TABULEIRO
// =====================

let tabuleiroDados = []; // array 2D (linhas x colunas)
let jogadorAtual = "A";  // começa o jogador A
let valorDadoAtual = null;
let casaSelecionada = null;

// Função para criar o estado inicial
function inicializarTabuleiro(linhas, colunas) {
  tabuleiroDados = [];

  for (let i = 0; i < linhas; i++) {
    const linha = [];
    for (let j = 0; j < colunas; j++) {
      if (i === 0) linha.push("B");       // linha 0 = peças do jogador B (vermelhas)
      else if (i === 3) linha.push("A");  // linha 3 = peças do jogador A (azuis)
      else linha.push(null);
    }
    tabuleiroDados.push(linha);
  }

  desenharTabuleiro();
}

function selecionarCasa(i, j) {
  const valor = tabuleiroDados[i][j];

  // Se ainda não foi lançando o dado, não pode jogar
  if (valorDadoAtual === null) {
    mensagemTexto.innerText = "🎲 Lança o dado antes de mover uma peça!";
    return;
  }

  // Se não há seleção ainda
  if (!casaSelecionada) {
    if (valor === jogadorAtual) {
      casaSelecionada = { i, j };
      mensagemTexto.innerText = `Selecionaste uma peça em [${i}, ${j}]. Move ${valorDadoAtual} casas.`;
    } else {
      mensagemTexto.innerText = "❌ Escolhe uma das tuas peças.";
    }
  } 
  // Se já existe seleção e o jogador clica noutra casa → tenta mover
  else {
    moverPeca(casaSelecionada.i, casaSelecionada.j, i, j);
    casaSelecionada = null;
  }
}


function moverPeca(i1, j1, i2, j2) {
  const destinoLivre = tabuleiroDados[i2][j2] === null;
  const distancia = Math.abs(j2 - j1);

  if (destinoLivre && distancia === valorDadoAtual) {
    tabuleiroDados[i2][j2] = tabuleiroDados[i1][j1];
    tabuleiroDados[i1][j1] = null;
    desenharTabuleiro();
    mensagemTexto.innerText = `✅ Peça movida para [${i2}, ${j2}].`;
    valorDadoAtual = null;
    alternarJogador();
  } else {
    mensagemTexto.innerText = "❌ Movimento inválido.";
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
// DADO DE PAUS
// =====================

// Seleciona a área do dado
const dadoArea = document.getElementById("dadoArea");
const paus = document.querySelectorAll(".pau");
const resultadoDado = document.getElementById("resultadoDado");
const mensagemTexto = document.getElementById("mensagemTexto");

// Função para lançar o dado

function lancarDado() {
  // Cada pau tem 2 lados → claro (0) ou escuro (1)
  let claros = 0;
  
  paus.forEach(pau => {
    const ladoClaro = Math.random() < 0.5; // 50% de probabilidade
    if (ladoClaro) {
      pau.classList.remove("escuro");
      claros++;
    } else {
      pau.classList.add("escuro");
    }
  });

  // Soma dos lados claros → traduzida em valor
  let valorDadoAtual = null;
  switch (claros) {
    case 0: valorDadoAtual = 6; break; // Sitteh
    case 1: valorDadoAtual = 1; break; // Tâb
    case 2: valorDadoAtual = 2; break; // Itneyn
    case 3: valorDadoAtual = 3; break; // Teláteh
    case 4: valorDadoAtual = 4; break; // Arba'ah
  }

  // Mostra o resultado
  resultadoDado.textContent = `Resultado: ${valorDadoAtual}`;
  mensagemTexto.innerHTML = `<strong> Saiu o valor ${valorDadoAtual} </strong> - move ${valorDadoAtual === 6 ? "6 casas (Sitteh)" : valorDadoAtual + " casas"}.`;


  dado.Area.style.transform = "scale(1.1)";
  setTimeout(() => dadoArea.style.transform = "scale(1)", 200);
  // Após alguns segundos, o dado volta ao estado inicial
  setTimeout(() => {
    paus.forEach(pau => pau.classList.remove("escuro"));
    resultadoDado.textContent = "Clique para lançar";
  }, 4000);

  return valorDadoAtual;
}

// Adiciona evento de clique
dadoArea.addEventListener("click", lancarDado);





// =====================
// ALTERNAR JOGADOR
// =====================

function alternarJogador() {
  jogadorAtual = jogadorAtual === "A" ? "B" : "A";
  mensagemTexto.innerText += ` Agora é a vez do jogador ${jogadorAtual === "A" ? "azul" : "vermelho"}.`;

  if (jogadorAtual =="B"){
    setTimeout(() => {
      valorDadoAtual = lancarDado();
      setTimeout(jogadaComputador, 3000);
    }, 1000);
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
// JODADAS VÁLIDAS
// =====================
function obterJogadasValidas(jogador) {
  const jogadas = [];

  for (let i = 0; i < tabuleiroDados.length; i++) {
    for (let j = 0; j < tabuleiroDados[i].length; j++) {
      if (tabuleiroDados[i][j] === jogador) {
        // tenta mover para a direita
        if (j + valorDadoAtual < tabuleiroDados[i].length && tabuleiroDados[i][j + valorDadoAtual] === null) {
          jogadas.push({
            origem: { linha: i, coluna: j },
            destino: { linha: i, coluna: j + valorDadoAtual }
          });
        }
        // tenta mover para a esquerda
        if (j - valorDadoAtual >= 0 && tabuleiroDados[i][j - valorDadoAtual] === null) {
          jogadas.push({
            origem: { linha: i, coluna: j },
            destino: { linha: i, coluna: j - valorDadoAtual }
          });
        }
      }
    }
  }
  return jogadas;
}

// =====================
// JOGADA DA IA
// =====================
function jogadaComputador() {
  // Apenas joga se for o turno do computador
  if (jogadorAtual !== "B") return;

  mensagemTexto.innerText = "🤖 O computador está a pensar...";

  // Pequeno atraso para parecer natural
  setTimeout(() => {
    // Determinar todas as jogadas válidas
    const jogadasValidas = obterJogadasValidas("B");

    if (jogadasValidas.length === 0) {
      mensagemTexto.innerText = "🤖 O computador não tem jogadas válidas.";
      alternarJogador();
      return;
    }

    // Escolher uma jogada aleatória
    const jogada = jogadasValidas[Math.floor(Math.random() * jogadasValidas.length)];

    // Executar a jogada
    moverPeca(jogada.origem.linha, jogada.origem.coluna, jogada.destino.linha, jogada.destino.coluna);

    mensagemTexto.innerText = `🤖 O computador moveu uma peça de [${jogada.origem.linha}, ${jogada.origem.coluna}] para [${jogada.destino.linha}, ${jogada.destino.coluna}].`;
  }, 1500);
}
