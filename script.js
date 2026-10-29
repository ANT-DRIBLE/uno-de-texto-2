"use strict";

const cores = ["vermelho", "azul", "verde", "amarelo"];

const dicas = {
  INTRO: "Na introdução, contextualize o tema e apresente sua tese.",
  TESE: "A tese expressa o ponto de vista que será defendido.",
  ARG: "Desenvolva argumentos e explique como sustentam sua tese.",
  CONC: "Conclua com uma proposta de intervenção viável e respeitosa.",
  "+2": "Use evidências e argumentos para aprofundar sua discussão.",
  "★": "Um bom repertório precisa ser pertinente ao tema."
};

const perguntas = [
  {
    pergunta: "Qual é a função da tese?",
    opcoes: [
      "Apresentar o ponto de vista defendido",
      "Contar uma história",
      "Listar referências"
    ],
    correta: 0,
    explicacao: "A tese apresenta o posicionamento central do texto."
  },
  {
    pergunta: "Qual conectivo indica oposição?",
    opcoes: ["Portanto", "Entretanto", "Além disso"],
    correta: 1,
    explicacao: "'Entretanto' estabelece uma relação de oposição."
  },
  {
    pergunta: "O que torna um repertório produtivo?",
    opcoes: [
      "Ser famoso",
      "Ser longo",
      "Estar relacionado ao tema e sustentar o argumento"
    ],
    correta: 2,
    explicacao: "O repertório deve ser pertinente e conectado à argumentação."
  },
  {
    pergunta: "O que deve conter uma proposta de intervenção?",
    opcoes: [
      "Uma ação viável e respeitosa dos direitos humanos",
      "Apenas uma opinião",
      "Somente a repetição da tese"
    ],
    correta: 0,
    explicacao: "A proposta deve apresentar uma solução articulada ao problema."
  },
  {
    pergunta: "Qual competência avalia a coesão textual?",
    opcoes: [
      "Competência 1",
      "Competência 4",
      "Competência 5"
    ],
    correta: 1,
    explicacao: "A Competência 4 avalia os mecanismos de coesão."
  }
];

let baralho = [];
let mao = [];
let bot = [];
let descarte = [];
let pontos = 0;
let perguntaAtual = null;
let bloqueado = false;
let esperandoUno = false;
let terminou = false;

const $ = id => document.getElementById(id);

function embaralhar(lista) {
  for (let i = lista.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [lista[i], lista[j]] = [lista[j], lista[i]];
  }
  return lista;
}

function criarBaralho() {
  const cartas = [];
  let id = 0;

  for (const cor of cores) {
    cartas.push({ id: id++, cor, valor: "INTRO" });
    cartas.push({ id: id++, cor, valor: "TESE" });
    cartas.push({ id: id++, cor, valor: "ARG" });
    cartas.push({ id: id++, cor, valor: "CONC" });
    cartas.push({ id: id++, cor, valor: "+2" });
  }

  for (let i = 0; i < 4; i++) {
    cartas.push({ id: id++, cor: "coringa", valor: "★" });
  }

  return embaralhar(cartas);
}

function topo() {
  return descarte[descarte.length - 1];
}

function jogavel(carta) {
  return carta.cor === "coringa" ||
    carta.cor === topo().cor ||
    carta.valor === topo().valor;
}

function criarCarta(carta, podeJogar, oculta = false) {
  const btn = document.createElement("button");
  btn.className = "carta " + (oculta ? "coringa" : carta.cor);
  btn.disabled = !podeJogar;
  btn.textContent = oculta ? "UNO" : carta.valor;

  if (oculta) {
    btn.setAttribute("aria-label", "Carta virada para baixo");
  }

  return btn;
}

function desenhar() {
  $("qtd-jogador").textContent = mao.length;
  $("qtd-bot").textContent = bot.length;
  $("pontos").textContent = pontos;

  const mesa = $("carta-atual");
  mesa.replaceChildren();
  mesa.appendChild(criarCarta(topo(), false));

  const minhas = $("minhas-cartas");
  minhas.replaceChildren();

  mao.forEach((carta, i) => {
    const btn = criarCarta(
      carta,
      !bloqueado && !terminou && !esperandoUno && jogavel(carta)
    );
    btn.addEventListener("click", () => jogar(i));
    minhas.appendChild(btn);
  });

  $("comprar").disabled = bloqueado || terminou || esperandoUno;
  $("uno").disabled = !esperandoUno || terminou;
}

function mensagem(texto) {
  $("mensagem").textContent = texto;
}

function jogar(indice) {
  if (bloqueado || terminou || esperandoUno) return;

  const carta = mao[indice];
  if (!jogavel(carta)) {
    mensagem("Escolha uma carta da mesma cor ou do mesmo símbolo.");
    return;
  }

  mao.splice(indice, 1);
  descarte.push(carta);

  $("dica").textContent = dicas[carta.valor] || dicas.ARG;

  if (carta.valor === "★") {
    const cor = cores[Math.floor(Math.random() * cores.length)];
    carta.corAnterior = "coringa";
    carta.cor = cor;
    mensagem("Coringa! A cor escolhida foi " + cor + ".");
  }

  desenhar();

  if (mao.length === 0) {
    finalizar(true);
    return;
  }

  if (mao.length === 1) {
    esperandoUno = true;
    mensagem("Você tem uma carta! Aperte UNO antes de continuar.");
    desenhar();
    return;
  }

  if (carta.valor === "+2") {
    comprarPara(bot, 2);
    mensagem("Você jogou +2. O RedaBot comprou duas cartas!");
  }

  desafio();
}

function comprarPara(maoAlvo, quantidade) {
  for (let i = 0; i < quantidade; i++) {
    if (baralho.length === 0) reciclar();
    if (baralho.length > 0) maoAlvo.push(baralho.pop());
  }
}

function reciclar() {
  if (descarte.length <= 1) return;
  const atual = descarte.pop();
  baralho = embaralhar(descarte);
  descarte = [atual];
}

function comprar() {
  if (bloqueado || terminou || esperandoUno) return;

  comprarPara(mao, 1);
  mensagem("Você comprou uma carta. Escolha uma carta válida ou passe a vez.");
  desenhar();
}

function desafio() {
  bloqueado = true;
  perguntaAtual = perguntas[
    Math.floor(Math.random() * perguntas.length)
  ];

  $("pergunta").textContent = perguntaAtual.pergunta;
  $("explicacao").textContent = "";

  const area = $("alternativas");
  area.replaceChildren();

  perguntaAtual.opcoes.forEach((opcao, i) => {
    const btn = document.createElement("button");
    btn.textContent = opcao;

    btn.addEventListener("click", () => {
      if (!bloqueado || terminou) return;

      bloqueado = false;
      const correta = i === perguntaAtual.correta;

      if (correta) {
        pontos += 100;
        btn.classList.add("correta");
        mensagem("Resposta correta! Você ganhou 100 pontos.");
      } else {
        btn.classList.add("errada");
        mensagem("Resposta incorreta. Leia a explicação e continue.");
      }

      [...area.children].forEach((b, index) => {
        b.disabled = true;
        if (index === perguntaAtual.correta) {
          b.classList.add("correta");
        }
      });

      $("explicacao").textContent = perguntaAtual.explicacao;
      desenhar();

      setTimeout(() => {
        if (!terminou) turnoBot();
      }, 1200);
    });

    area.appendChild(btn);
  });
}

function turnoBot() {
  if (terminou) return;

  esperandoUno = false;

  const indices = bot
    .map((carta, i) => jogavel(carta) ? i : -1)
    .filter(i => i >= 0);

  if (indices.length === 0) {
    comprarPara(bot, 1);
    mensagem("O RedaBot comprou uma carta e passou a vez.");
    desenhar();
    return;
  }

  const indice = indices[0];
  const carta = bot.splice(indice, 1)[0];

  if (carta.valor === "★") {
    const corMaisFrequente = cores
      .map(cor => ({
        cor,
        quantidade: bot.filter(c => c.cor === cor).length
      }))
      .sort((a, b) => b.quantidade - a.quantidade)[0];

    carta.cor = corMaisFrequente.cor;
  }

  descarte.push(carta);

  if (carta.valor === "+2") comprarPara(mao, 2);

  if (bot.length === 0) {
    desenhar();
    finalizar(false);
    return;
  }

  if (mao.length === 1) {
    esperandoUno = true;
  }

  desenhar();
  mensagem("O RedaBot jogou " + carta.valor + ". Sua vez!");
}

function chamarUno() {
  if (!esperandoUno || terminou) return;

  esperandoUno = false;
  mensagem("UNO! Você chamou a tempo!");
  desenhar();

  setTimeout(turnoBot, 700);
}

function finalizar(venceu) {
  terminou = true;

  if (venceu) {
    pontos += 500;
    mensagem("🎉 Você venceu! Bônus de 500 pontos.");
  } else {
    mensagem("O RedaBot venceu! Estude as dicas e tente novamente.");
  }

  desenhar();
}

function iniciar() {
  baralho = criarBaralho();
  mao = [];
  bot = [];
  descarte = [];
  pontos = 0;
  bloqueado = false;
  esperandoUno = false;
  terminou = false;

  comprarPara(mao, 7);
  comprarPara(bot, 7);

  descarte.push(baralho.pop());

  $("pergunta").textContent =
    "Jogue uma carta para receber uma pergunta.";
  $("alternativas").replaceChildren();
  $("explicacao").textContent = "";
  $("dica").textContent =
    "Uma boa redação apresenta tese clara e argumentos consistentes.";

  mensagem("Sua vez! Combine a cor ou o símbolo.");
  desenhar();
}

$("comprar").addEventListener("click", comprar);
$("uno").addEventListener("click", chamarUno);
$("reiniciar").addEventListener("click", iniciar);

iniciar();
