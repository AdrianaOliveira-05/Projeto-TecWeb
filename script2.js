document.addEventListener("DOMContentLoaded", () => {
  // ELEMENTOS PRINCIPAIS
  const secIdent = document.getElementById("identificacao");
  const secConfig = document.getElementById("configuracao");
  const secComandos = document.getElementById("comandos");
  const secJogo = document.getElementById("jogo");

  // CONJUNTOS DE BOTÕES
  const comandosAntes = document.getElementById("comandosAntes");
  const comandosDurante = document.getElementById("comandosDurante");

  // BOTÕES
  const btnLogin = document.getElementById("btnLogin");
  const btnIniciar = document.getElementById("btnIniciarJogo");
  const btnDesistir = document.getElementById("btnDesistir");

  // PAINÉIS
  const painelInstr = document.getElementById("instrucoes");
  const painelClass = document.getElementById("classificacoes");
  const botoesFechar = document.querySelectorAll(".btnFechar");

  const btnInstr1 = document.getElementById("btnVerInstrucoes");
  const btnInstr2 = document.getElementById("btnVerInstrucoes2");
  const btnClass1 = document.getElementById("btnVerClassificacoes");
  const btnClass2 = document.getElementById("btnVerClassificacoes2");

  // ===== ESTADO INICIAL =====
  function estadoInicial() {
    secIdent.classList.remove("oculto");
    secConfig.classList.add("oculto");
    secComandos.classList.add("oculto");
    secJogo.classList.add("oculto");
    comandosAntes.classList.remove("oculto");
    comandosDurante.classList.add("oculto");
  }

  estadoInicial();

  // ===== LOGIN =====
  btnLogin.addEventListener("click", () => {
    const user = document.getElementById("user").value.trim();
    if (user === "") {
      alert("Insere o nome de utilizador!");
      return;
    }

    // Esconde identificação
    secIdent.classList.add("oculto");

    // Mostra configuração + comandos iniciais
    secConfig.classList.remove("oculto");
    secComandos.classList.remove("oculto");

    // Garante que só aparecem botões iniciais
    comandosAntes.classList.remove("oculto");
    comandosDurante.classList.add("oculto");
  });

  // ===== INICIAR JOGO =====
  btnIniciar.addEventListener("click", () => {
    // Esconde configuração
    secConfig.classList.add("oculto");

    // Mostra jogo (tabuleiro + dado + mensagens)
    secJogo.classList.remove("oculto");

    // Mostra apenas comandos durante o jogo
    comandosAntes.classList.add("oculto");
    comandosDurante.classList.remove("oculto");
  });

  // ===== DESISTIR =====
  btnDesistir.addEventListener("click", () => {
    // Esconde jogo
    secJogo.classList.add("oculto");

    // Mostra configuração outra vez
    secConfig.classList.remove("oculto");

    // Mostra novamente comandos iniciais
    comandosDurante.classList.add("oculto");
    comandosAntes.classList.remove("oculto");
  });

  // ===== PAINÉIS =====
  function abrirPainel(painel) {
    painel.classList.remove("oculto");
  }

  function fecharPainel() {
    painelInstr.classList.add("oculto");
    painelClass.classList.add("oculto");
  }

  btnInstr1.addEventListener("click", () => abrirPainel(painelInstr));
  btnInstr2.addEventListener("click", () => abrirPainel(painelInstr));
  btnClass1.addEventListener("click", () => abrirPainel(painelClass));
  btnClass2.addEventListener("click", () => abrirPainel(painelClass));
  botoesFechar.forEach(btn => btn.addEventListener("click", fecharPainel));
});
