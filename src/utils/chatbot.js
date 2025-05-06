import { getRandomFromArray, sanitizeText } from './utils';

const greetingTemplates = [
  "Fala {name}! 🔥 Eu sou o Fuzzy, o bot mais furioso do pedaço. Bora conversar?",
  "Salve {name}! 👊 Tamo junto! Me chama que eu te ajudo com tudo da FURIA! 💥",
  "E aí {name}, pronto(a) pra mais uma partida? 🎮 O que manda hoje?",
  "Bem-vindo ao território da FURIA, {name}! 🐆 Eu sou o Fuzzy, seu guia oficial. Qual é a missão?",
  "Oi {name}! 😎 Já tomou sua dose de hype hoje? Vem comigo que o Fuzzy manja dos paranauê!",
  "{name}, cheguei chegando! 💣 Manda a braba aí que eu resolvo!",
  "Faaaaaala {name}! 🚀 Bora dar aquela moral pro(a) fã mais casca da FURIA?",
  "To on, {name}! 🔛 Se quiser lineup, curiosidades, saber mais sobre os times... é só pedir! 😜",
  "E aí, {name}! ⚡️ Se for sobre a FURIA, o Fuzzy resolve no clutch!",
  "{name}, se prepara porque aqui é informação na velocidade de bala da AWP! 🎯 Me diz aí no que posso ajudar!"
];

const fallbackMessages = [
  "Desculpa, {name}, não entendi muito bem... 🤔 Tente perguntar de outro jeito!",
  "Hmm... essa eu não sei responder ainda 😅. Você pode tentar algo como 'agenda' ou 'produtos'.",
  "Não reconheci essa pergunta, {name}. Mas tô aprendendo com cada conversa! 💡",
  "Ops! Ainda não tenho uma resposta pra isso. Mas posso falar sobre a FURIA ou os próximos jogos!",
  "Essa foi difícil 😵‍💫. Tente perguntar sobre CS, LOL ou os desafios do app.",
  "Calma lá, {name} 😄! Me pergunta algo como 'quando é o próximo jogo?' ou 'quantas moedas eu tenho?'.",
  "Ainda não saquei essa... 🤖💤 Mas posso te contar curiosidades da FURIA ou te ajudar com o app!",
  "Sou só um bot em treinamento 🧠✨. Tenta reformular sua pergunta?",
  "Ué! Não entendi 🤨. Mas sei bastante sobre a FURIA, os times e até os produtos da loja!",
  "Eita, {name}, essa foi braba! Me pergunta sobre os modos de jogo, eventos ou o time que eu dou conta 😎"
];

// respostas sobre agenda de jogos
const agendaFallbacks = [
  "Então {name}, eu ainda não tenho acesso à agenda da FURIA em tempo real. Recomendo seguir as redes sociais pra ver o cronograma certinho: https://www.instagram.com/furiagg/ 🦊",
  "Eita, infelizmente não tenho o cronograma ao vivo, mas logo logo vou ter! Enquanto isso, segue o Insta da FURIA, lá você fica por dentro do que está por vir: https://www.instagram.com/furiagg/",
  "Infelizmente ainda não posso te dar essa info, mas se quiser ver reprises ou lives, dá uma olhadinha em <Link to='/lives'>nossa seção de lives</Link>! 😉"
];

const csScheduleReplies = [
  "Ainda não tenho os dados dos próximos jogos de CS, {name}, mas você pode acompanhar tudo no Insta oficial: https://www.instagram.com/furiagg/ 🔫",
  "Infelizmente não sei quando é o próximo jogo de CS 😔. Mas fica de olho no Instagram da FURIA: https://www.instagram.com/furiagg/",
  "Por enquanto, {name}, o cronograma de CS não tá disponível aqui, mas tem tudo fresquinho no perfil oficial: https://www.instagram.com/furiagg/"
];

const futebolScheduleReplies = [
  "Ainda não tenho a informação sobre o próximo jogo do time de futebol ⚽, mas dá uma olhadinha no Insta: https://www.instagram.com/furia.football/",
  "E aí {name}, pra acompanhar o time de futebol da FURIA, corre lá no Instagram deles: https://www.instagram.com/furia.football/ 🥅",
  "Infelizmente não sei a data exata do próximo jogo de futebol, mas o perfil da FURIA Football tem tudo certinho: https://www.instagram.com/furia.football/"
];

const redramScheduleReplies = [
  "Ainda não tenho info sobre os eventos da Redram, {name}, mas você pode acompanhar no Insta: https://www.instagram.com/furia.redram/ 🔥",
  "Confere o perfil da Redram pra ver as próximas movimentações: https://www.instagram.com/furia.redram/",
  "Infelizmente não tenho o cronograma da Redram aqui, mas fica de olho no Instagram deles: https://www.instagram.com/furia.redram/"
];

const lolScheduleReplies = [
  "O cronograma do time de LoL ainda não está disponível por aqui 😓. Mas o Insta da FURIA LoL sempre atualiza: https://www.instagram.com/furia.lol/",
  "Quer saber quando o time de LoL entra em ação? Acompanha eles em: https://www.instagram.com/furia.lol/ 🎮",
  "Ainda não sei os próximos jogos do time de LoL, mas no Insta tem tudo atualizado: https://www.instagram.com/furia.lol/"
];

const valorantScheduleReplies = [
  "Infelizmente não tenho os dados em tempo real do time de Valorant 😔, mas o Insta tá sempre atualizado: https://www.instagram.com/furia.valorant/",
  "Quer saber quando o squad de Valorant joga? Segue eles aqui: https://www.instagram.com/furia.valorant/ 💥",
  "Opa {name}, por enquanto sem datas aqui, mas o Insta da FURIA Valorant resolve fácil: https://www.instagram.com/furia.valorant/"
];

const r6ScheduleReplies = [
  "Ainda não sei os horários do próximo jogo de R6, mas pode seguir eles no Instagram: https://www.instagram.com/furia.r6/ 🕹️",
  "Fica de olho nas redes sociais do time de R6, {name}! https://www.instagram.com/furia.r6/",
  "Pra saber tudo sobre os próximos jogos de Rainbow Six, dá uma conferida no Insta oficial: https://www.instagram.com/furia.r6/"
];

const fallbackNames = ['chefia', 'lenda', 'recruta', 'parça', 'furioso(a)'];

function getFallbackName() {
  return fallbackNames[Math.floor(Math.random() * fallbackNames.length)]
}

function getUserName(name) {
  if (!name || typeof name !== 'string' || name.trim() === "" || name === "Usuário(a)") {
    return getFallbackName();
  }
  return name;
}

// Função para selecionar aleatoriamente a mensagem de boas vindas
export function getRandomGreeting(name) {
  return getRandomFromArray(greetingTemplates).replace('{name}', getUserName(name));
}

// respostas do chatbot
export function getBotReply(message, name, user) {
  const normalized = sanitizeText(message);

  // Agenda / Próximos Jogos
  if (normalized.includes("agenda") || normalized.includes("proximo jogo") || normalized.includes("prox jg") || normalized.includes("prox jogo") || normalized.includes("proximos jogos") || normalized.includes("calendario") || normalized.includes("programacao") || normalized.includes("cronograma") || normalized.includes("proxima corrida") || normalized.includes("proximas corridas") || normalized.includes("prox corrida") || normalized.includes("prox corridas")) {
    if (normalized.includes("cs") || normalized.includes("counter strike")) {
      return getRandomFromArray(csScheduleReplies).replace("{name}", getUserName(name));
    } else if (normalized.includes("futebol") || normalized.includes("kings league") || normalized.includes("furia fc") || normalized.includes("fut")) {
      return getRandomFromArray(futebolScheduleReplies).replace("{name}", getUserName(name));
    } else if (normalized.includes("redram") || normalized.includes("automobilismo") || normalized.includes("porsche")) {
      return getRandomFromArray(redramScheduleReplies).replace("{name}", getUserName(name));
    } else if (normalized.includes("lol") || normalized.includes("league of legends")) {
      return getRandomFromArray(lolScheduleReplies).replace("{name}", getUserName(name));
    } else if (normalized.includes("valorant")) {
      return getRandomFromArray(valorantScheduleReplies).replace("{name}", getUserName(name));
    } else if (normalized.includes("r6") || normalized.includes("rainbow")) {
      return getRandomFromArray(r6ScheduleReplies).replace("{name}", getUserName(name));
    } else {
      return getRandomFromArray(agendaFallbacks).replace("{name}", getUserName(name));
    }
  }

  //CS
  if (/(comecou|estreou|iniciou|inicio|estreia|comeco|me fala|me conta).*(cs|csgo|cs2|countercs|go|counter-?strike)/.test(normalized)) {
    const replies = [
      "A FURIA fez sua estreia no CS:GO em 2017, competindo pela primeira vez na DreamHack Summer 2017 — e desde então só evoluímos! 🎮",
      "{name}, a FURIA estreou no cenário de CS:GO em 2017 na DreamHack Summer 2017 – olha o quanto crescemos desde então! 🚀"
    ];
    return getRandomFromArray(replies).replace("{name}", getUserName(name));
  }

  if (/(furia|cs|csgo|cs2|countercs|go|counter-?strike).*(comecou|estreou|iniciou|inicio|estreia|comeco).*(major|majors)/.test(normalized)) {
    const replies = [
      "Nossa estreia em Major foi no IEM Katowice 2019, onde já mostramos nossa garra! 🏅",
      "{name}, a FURIA jogou seu primeiro Major no IEM Katowice 2019 e já chegou chegando! 💥"
    ];
    return getRandomFromArray(replies).replace("{name}", getUserName(name));
  }

  if (/(maior|principal|melhor|importante).*(conquista|trofeu|titulo).*(cs|csgo|cs2|countercs|go|counter-?strike)/.test(normalized)) {
    const replies = [
      "Entre nossos grandes títulos está a DreamHack Open Summer 2020 – e tem muito mais por vir! 🏆",
      "{name}, um dos nossos maiores triunfos foi na DreamHack Open Summer 2020. Logo vem mais! 💪"
    ];
    return getRandomFromArray(replies).replace("{name}", getUserName(name));
  }

  if (/(furia|cs|csgo|cs2|countercs|go|counter-?strike).*(venceu|ganhou|conquistou).*(major)/.test(normalized)) {
    const replies = [
      "Ainda não conquistamos um Major, mas estamos cada vez mais perto! 🎯",
      "{name}, apesar de ainda não termos um Major, nossa evolução é constante – em breve celebraremos juntos! ✨"
    ];
    return getRandomFromArray(replies).replace("{name}", getUserName(name));
  }

  if (/(furia|cs|csgo|cs2|countercs|go|counter-?strike).*(melhor|maior|mais longe|principal).*(colocacao|resultado).*(major)/.test(normalized)) {
    const replies = [
      "Nossa melhor campanha em Major foi nas quartas de final do IEM Katowice 2019! ⚔️",
      "{name}, a FURIA brilhou nas quartas de final do IEM Katowice 2019 – nosso recorde em Majors! 🌟"
    ];
    return getRandomFromArray(replies).replace("{name}", getUserName(name));
  }

  if (/(ultima|ultimo|recente).*(conquista|titulo|trofeu).*(cs|csgo|cs2|countercs|go|counter-?strike)/.test(normalized)) {
    const replies = [
      "Nossa conquista mais recente foi na ESL Challenger Melbourne 2023 – FURIA mostrando força internacional! 🐾🏆",
      "{name}, a última taça veio com a vitória na ESL Challenger Melbourne 2023. Seguimos em busca de mais! 🔥"
    ];
    return getRandomFromArray(replies).replace("{name}", getUserName(name));
  }

  if (/(todos os|quais|qual|principais|principal|maiores|maior|conquistas|consquista|titulo|titulos).*(conquistas|títulos|titulos|troféus|trofeus|titulo|conquista|trofeu).*(cs|csgo|cs2|countercs|go|counter-?strike)/.test(normalized)) {
    const replies = [
      "A FURIA já levantou várias taças no CS: ESL Challenger Melbourne 2023, Elisa Invitational Fall 2021, IEM New York NA 2020, DreamHack Open Summer 2020, ESL Pro League Season 12 NA e ECS Season 7 NA! 🏆🦁",
      "{name}, nossos principais títulos no CS incluem: ESL Challenger Melbourne 2023, IEM New York NA 2020 e ESL Pro League Season 12 NA. Uma trajetória de respeito no cenário mundial! 🔫🔥"
    ];
    return getRandomFromArray(replies).replace("{name}", getUserName(name));
  }

  if (/(jogadores atuais|elenco atual|time atual|jogadores|elenco|line|lineup).*(furia|cs|csgo|cs2|countercs|go|counter-?strike)/.test(normalized)) {
    const replies = [
      "Atualmente, nosso lineup de CS2 conta com nomes de peso: FalleN, yuurih, KSCERATO, chelo e skullz. Uma verdadeira seleção prontos pra dominar! Saiba mais no nosso Instagram: https://www.instagram.com/furiagg/ 🦈💥",
      "{name}, o time de CS da FURIA hoje é formado por FalleN, yuurih, KSCERATO, chelo e skullz – cinco feras que representam com garra! 🖤🎮 Acompanha a gente no Insta: https://www.instagram.com/furiagg/"
    ];
    return getRandomFromArray(replies).replace("{name}", getUserName(name));
  }

  if (/(furia|cs|csgo|cs2|countercs|go|counter-?strike).*(pior|menor|fraco|ruim).*(resultado|colocacao)/.test(normalized)) {
    const replies = [
      "Embora tenhamos enfrentado uma eliminação precoce no Major de 2020, mostramos nossa força e logo conquistamos a DreamHack Open Summer 2020! 💪🏆",
      "{name}, sabemos que nossa eliminação nas oitavas do Major de 2020 não foi o que esperávamos, mas logo em seguida, conquistamos a DreamHack Open Summer 2020 – e isso é só o começo! 🚀"
    ];
    return getRandomFromArray(replies).replace("{name}", getUserName(name));
  }

  if (/(jogos|ao vivo|acompanhar|assistir|ver).*(cs|csgo|cs2|countercs|go|counter-?strike)/.test(normalized)) {
    const replies = [
      "Os jogos de CS da FURIA costumam ser transmitidos na Twitch ou no YouTube, dependendo do campeonato. Fica ligado no nosso Instagram pra não perder nada: https://www.instagram.com/furiagg/ 🔫🔥",
      "{name}, quer assistir CS com emoção? A transmissão muda conforme o torneio, mas a gente sempre avisa no Insta: https://www.instagram.com/furiagg/ 📺💥"
    ];
    return getRandomFromArray(replies).replace("{name}", getUserName(name));
  }

  //LOL
  if (/(comecou|estreou|iniciou|inicio|estreia|comeco).*(lol|league of legends)/.test(normalized)) {
    const replies = [
      "A FURIA estreou no competitivo de League of Legends em 2018, competindo pela primeira vez no CBLOL – desde então, só evoluímos! 🐉🎮",
      "{name}, a FURIA fez sua estreia no CBLOL em 2018, mostrando que chegou para conquistar as Rift! 🚀"
    ];
    return getRandomFromArray(replies).replace("{name}", getUserName(name));
  }

  if (/(furia|lol|league of legends).*(estreou|iniciou|comecou).*(cblol)/.test(normalized)) {
    const replies = [
      "Nossa estreia no CBLOL foi em 2019, e já começamos mostrando nossa força no cenário nacional! 🏆",
      "{name}, a FURIA jogou seu primeiro CBLOL em 2019, e logo conquistou seu espaço entre as melhores equipes! 💥"
    ];
    return getRandomFromArray(replies).replace("{name}", getUserName(name));
  }

  if (/(maior|principal|melhor|importante).*(conquista|trofeu|titulo).*(lol|league of legends)/.test(normalized)) {
    const replies = [
      "Entre nossos grandes títulos no LoL está a vitória no CBLOL 2020 – o primeiro passo para mais conquistas! 🏆",
      "{name}, um dos nossos maiores triunfos foi na vitória do CBLOL 2020! O que vem por aí é ainda maior! 🔥"
    ];
    return getRandomFromArray(replies).replace("{name}", getUserName(name));
  }

  if (/(furia|lol|league of legends).*(venceu|ganhou|conquistou).*(cblol)/.test(normalized)) {
    const replies = [
      "A FURIA já conquistou o CBLOL em 2020, e estamos prontos para mais vitórias no futuro! 🏅",
      "{name}, o título do CBLOL 2020 foi apenas o começo! Logo, teremos mais vitórias para celebrar! ✨"
    ];
    return getRandomFromArray(replies).replace("{name}", getUserName(name));
  }

  if (/(furia|lol|league of legends).*(melhor|maior|mais longe|principal).*(colocacao|resultado).*(cblol)/.test(normalized)) {
    const replies = [
      "Nossa melhor campanha no CBLOL foi o título de campeões em 2020! 🔥",
      "{name}, nossa maior conquista no CBLOL foi ser campeões em 2020 – e a caminhada não para por aí! 🏆"
    ];
    return getRandomFromArray(replies).replace("{name}", getUserName(name));
  }

  if (/(ultima|ultimo|recente).*(conquista|titulo|trofeu).*(lol|league of legends)/.test(normalized)) {
    const replies = [
      "Nossa última conquista foi a vitória no CBLOL 2020 – ainda estamos saboreando essa grande vitória! 🍾🏆",
      "{name}, a última taça que conquistamos foi o CBLOL 2020 – e já estamos focados nos próximos campeonatos! 💪"
    ];
    return getRandomFromArray(replies).replace("{name}", getUserName(name));
  }

  if (/(todos os|quais|qual|principais|principal|maiores|maior|conquistas|consquista|titulo|titulos).*(conquistas|títulos|titulos|troféus|trofeus|titulo|conquista|trofeu).*(lol|league of legends)/.test(normalized)) {
    const replies = [
      "A FURIA venceu o CBLOL 2020 como PRG (antes da fusão), e vem crescendo cada vez mais na elite do League of Legends brasileiro! 🏆🐯",
      "{name}, nosso título mais marcante até agora foi o CBLOL 2020 (como PRG). Desde então, seguimos firmes no topo do cenário nacional! 💜🎮"
    ];
    return getRandomFromArray(replies).replace("{name}", getUserName(name));
  }

  if (/(jogadores atuais|elenco atual|time atual|jogadores|elenco|line|lineup).*(furia|lol|league of legends)/.test(normalized)) {
    const replies = [
      "O elenco atual da FURIA no LoL é composto por grandes nomes como !BRTT, yang, Robo, esA e fury – juntos, dominando as Rift! 💥🎮 Saiba mais sobre o elenco em https://www.instagram.com/furia.lol/",
      "{name}, o time de LoL da FURIA hoje é composto por !BRTT, yang, Robo, esA e fury. A FURIA no LoL está com tudo! 🔥"
    ];
    return getRandomFromArray(replies).replace("{name}", getUserName(name));
  }

  if (/(furia|lol|league of legends).*(pior|menor|fraco|ruim).*(resultado|colocacao)/.test(normalized)) {
    const replies = [
      "Embora tenhamos enfrentado alguns desafios no CBLOL de 2018, nos levantamos e conquistamos o título em 2020! 🏆",
      "{name}, sabemos que nossa campanha no CBLOL de 2018 não foi a ideal, mas em 2020, fomos campeões – sempre aprendendo e evoluindo! 🚀"
    ];
    return getRandomFromArray(replies).replace("{name}", getUserName(name));
  }

  if (/(jogos|ao vivo|acompanhar|assistir|ver).*(lol|league of legends)/.test(normalized)) {
    const replies = [
      "Quer assistir nossos jogos de LoL? A transmissão varia por torneio, mas a gente sempre avisa tudo certinho no Instagram: https://www.instagram.com/furia.lol/ 🧙‍♂️⚔️",
      "{name}, normalmente os jogos rolam na Twitch ou no YouTube. Segue a gente no Insta pra ficar por dentro: https://www.instagram.com/furia.lol/ 🧠🔥"
    ];
    return getRandomFromArray(replies).replace("{name}", getUserName(name));
  }

  // VALORANT

  if (/(comecou|estreou|iniciou|inicio|estreia|comeco).*(valorant|val)/.test(normalized)) {
    const replies = [
      "A FURIA fez sua estreia no competitivo de Valorant em 2020, competindo pela primeira vez na VCT Challengers Stage 1 Brasil – e desde então não paramos de crescer! 🔥🎮",
      "{name}, a FURIA entrou no cenário de Valorant em 2020 na VCT Challengers Stage 1 Brasil e logo mostrou sua força! 🚀"
    ];
    return getRandomFromArray(replies).replace("{name}", getUserName(name));
  }

  if (/(furia|valorant|val).*(estreou|iniciou|comecou).*(vct|challengers)/.test(normalized)) {
    const replies = [
      "Nossa estreia no VCT Challengers Stage 1 Brasil foi em 2020, e já chegamos mostrando nossa garra! 🏅",
      "{name}, a FURIA disputou seu primeiro VCT Challengers Stage 1 Brasil em 2020 – um ótimo começo no cenário! 💥"
    ];
    return getRandomFromArray(replies).replace("{name}", getUserName(name));
  }

  if (/(maior|principal|melhor|importante).*(conquista|trofeu|titulo).*(valorant|val)/.test(normalized)) {
    const replies = [
      "Uma das nossas maiores conquistas no Valorant foi o título do VCT Challengers Stage 2 Brasil 2021 – e estamos atrás de muito mais! 🏆",
      "{name}, a FURIA levantou a taça do VCT Challengers Stage 2 Brasil 2021. Prepare-se para próximas vitórias! 🔥"
    ];
    return getRandomFromArray(replies).replace("{name}", getUserName(name));
  }

  if (/(furia|valorant|val).*(venceu|ganhou|conquistou).*(vct|challengers)/.test(normalized)) {
    const replies = [
      "A FURIA já conquistou o VCT Challengers Stage 2 Brasil 2021 e segue em busca de mais títulos! 🏅",
      "{name}, nossa vitória no VCT Challengers Stage 2 Brasil 2021 mostrou que estamos prontos para dominar o cenário! ✨"
    ];
    return getRandomFromArray(replies).replace("{name}", getUserName(name));
  }

  if (/(furia|valorant|val).*(melhor|maior|mais longe).*(colocacao|resultado).*(vct|challengers)/.test(normalized)) {
    const replies = [
      "Nossa melhor campanha foi no VCT Challengers Stage 2 Brasil 2021, quando fomos campeões! ⚔️",
      "{name}, a FURIA brilhou no VCT Challengers Stage 2 Brasil 2021, conquistando o título – nosso recorde! 🌟"
    ];
    return getRandomFromArray(replies).replace("{name}", getUserName(name));
  }

  if (/(ultima|ultimo|recente).*(conquista|titulo|trofeu).*(valorant|val)/.test(normalized)) {
    const replies = [
      "Nossa última taça foi no VCT Challengers Stage 2 Brasil 2021 – ainda estamos celebrando! 🏆",
      "{name}, a última conquista veio com o título no VCT Challengers Stage 2 Brasil 2021. Vamos atrás de mais! 🔥"
    ];
    return getRandomFromArray(replies).replace("{name}", getUserName(name));
  }

  if (/(todos os|quais|qual|principais|principal|maiores|maior|conquistas|consquista|titulo|titulos).*(conquistas|títulos|titulos|troféus|trofeus|titulo|conquista|trofeu).*(valorant|val)/.test(normalized)) {
    const replies = [
      "A FURIA foi campeã do VCT Challengers Stage 2 Brasil em 2021, e também venceu o Vava Champs e o Spike Ladies como destaque em outras frentes competitivas. 🏆🎯",
      "{name}, nossos principais títulos no Valorant incluem o VCT Challengers Stage 2 Brasil 2021, além de conquistas como o Vava Champs e Spike Ladies! 💥🔥"
    ];
    return getRandomFromArray(replies).replace("{name}", getUserName(name));
  }

  if (/(jogadores atuais|elenco atual|time atual|jogadores|elenco|line|lineup).*(furia|valorant|val)/.test(normalized)) {
    const replies = [
      "O elenco atual de Valorant da FURIA é formado por Fx, Khalil, mwzera, saadhak e latto – uma verdadeira potência em cada batalha!",
      "{name}, nosso line‑up de Valorant hoje conta com Fx, Khalil, mwzera, saadhak e latto – juntos, dominamos o cenário! 🔥 Clica aqui: https://www.instagram.com/furia.valorant/ para conhecer mais sobre o elenco"
    ];
    return getRandomFromArray(replies).replace("{name}", getUserName(name));
  }

  if (/(furia|valorant|val).*(pior|menor|fraco|ruim).*(resultado|colocacao)/.test(normalized)) {
    const replies = [
      "Embora tenhamos tido algumas quedas no início, logo em seguida conquistamos o VCT Challengers Stage 2 Brasil 2021! 💪🏆",
      "{name}, nosso começo no Valorant teve altos e baixos, mas logo celebramos o título do VCT Challengers Stage 2 Brasil 2021 – isso mostra nossa resiliência! 🚀"
    ];
    return getRandomFromArray(replies).replace("{name}", getUserName(name));
  }

  if (/(jogos|ao vivo|acompanhar|assistir|ver).*(valorant|val)/.test(normalized)) {
    const replies = [
      "Os jogos de Valorant da FURIA são intensos! As transmissões mudam de acordo com o campeonato, mas no Insta a gente posta tudo: https://www.instagram.com/furia.valorant/ 🎯⚡",
      "{name}, quer ver as plays de Valorant da FURIA? Fica ligado no nosso Instagram pra saber quando e onde assistir: https://www.instagram.com/furia.valorant/ 🚀📺"
    ];
    return getRandomFromArray(replies).replace("{name}", getUserName(name));
  }

  // RAINBOW SIX: SIEGE

  if (/(comecou|estreou|iniciou|inicio|estreia|comeco).*(rainbow|r6|rainbow six)/.test(normalized)) {
    const replies = [
      "A FURIA fez sua estreia no competitivo de R6 em 2020, disputando o Six Invitational 2020 em Montreal – e desde então mostramos garra em cada round! 🎯",
      "{name}, a FURIA entrou no cenário de Rainbow Six: Siege em 2020 no Six Invitational 2020, e logo deixou sua marca! 🚀"
    ];
    return getRandomFromArray(replies).replace("{name}", getUserName(name));
  }

  if (/(furia|rainbow|r6|rainbow six).*(estreou|iniciou|comecou).*(six invitational|major|invitan)/.test(normalized)) {
    const replies = [
      "Nossa primeira grande aparição foi no Six Invitational 2020, onde a equipe já justificou seu lugar entre os melhores! 🏆",
      "{name}, a FURIA vestiu as cores no Six Invitational 2020 – nossa estreia em um Major de R6 cheia de emoção! 🔥"
    ];
    return getRandomFromArray(replies).replace("{name}", getUserName(name));
  }

  if (/(maior|principal|melhor|importante).*(conquista|trofeu|titulo).*(rainbow|r6|rainbow six)/.test(normalized)) {
    const replies = [
      "Um dos destaques foi a vitória na Latin America League Season 11 em 2021 – mostramos que somos ferozes! 🏆",
      "{name}, nosso título mais expressivo no R6 foi na Latin America League Season 11 (2021). Vem muito mais por aí! 🎉"
    ];
    return getRandomFromArray(replies).replace("{name}", getUserName(name));
  }

  if (/(furia|rainbow|r6|rainbow six).*(venceu|ganhou|conquistou).*(league|season|lae)/.test(normalized)) {
    const replies = [
      "A FURIA já conquistou a Latin America League Season 11 em 2021 e segue firme em busca de novos títulos! 🔥",
      "{name}, nossa vitória na LA League Season 11 (2021) comprovou nossa força – estamos prontos para o próximo desafio! 💪"
    ];
    return getRandomFromArray(replies).replace("{name}", getUserName(name));
  }

  if (/(furia|rainbow|r6|rainbow six).*(melhor|maior|mais longe).*(colocacao|resultado).*(invita|season|league)/.test(normalized)) {
    const replies = [
      "Nossa melhor campanha foi no Six Invitational 2021, chegando às quartas de final! ⚔️",
      "{name}, a FURIA brilhou no Six Invitational 2021 ao alcançar as quartas de final – nosso recorde até agora! 🌟"
    ];
    return getRandomFromArray(replies).replace("{name}", getUserName(name));
  }

  if (/(ultima|ultimo|recente).*(conquista|titulo|trofeu).*(rainbow|r6|rainbow six)/.test(normalized)) {
    const replies = [
      "Nossa última taça veio com a vitória na Latin America League Season 11 (2021) – ainda estamos celebrando! 🎉🏆",
      "{name}, a conquista mais recente foi o título da LA League Season 11 em 2021. Seguimos em frente! 🚀"
    ];
    return getRandomFromArray(replies).replace("{name}", getUserName(name));
  }

  if (/(todos os|quais|qual|principais|principal|maiores|maior|conquistas|consquista|titulo|titulos).*(conquistas|títulos|titulos|troféus|trofeus|titulo|conquista|trofeu).*(rainbow|r6|rainbow six|siege)/.test(normalized)) {
    const replies = [
      "A FURIA já conquistou títulos importantes no Rainbow Six Siege, incluindo a Copa do Brasil de 2022 e a Super Copa do Brasil de 2024. 🏆🔥",
      "{name}, nossos principais títulos no R6 são: Copa do Brasil 2022 e Super Copa do Brasil 2024. Seguimos em busca de mais conquistas! 💪🎮"
    ];
    return getRandomFromArray(replies).replace("{name}", getUserName(name));
  }

  if (/(jogadores atuais|elenco atual|time atual|jogadores|elenco|line|lineup).*(furia|rainbow|r6|rainbow six)/.test(normalized)) {
    const replies = [
      "O elenco atual de R6 da FURIA é formado por nts, xtinct, pax, bite e danzn – juntos defendemos cada ponto! 🔒🎮",
      "{name}, nosso line‑up de Rainbow Six é nts, xtinct, pax, bite e danzn – uma equipe pronta para qualquer desafio! Que tal conhecer mais sobre o elenco? 💪 Acompanha o nosso insta: https://www.instagram.com/furia.r6/"
    ];
    return getRandomFromArray(replies).replace("{name}", getUserName(name));
  }

  if (/(furia|rainbow|r6|rainbow six).*(pior|menor|fraco|ruim).*(resultado|colocacao)/.test(normalized)) {
    const replies = [
      "Mesmo após um resultado abaixo do esperado no Six Invitational 2022, nos reerguemos e vencemos a LATAM Major 2022! 🌟🏆",
      "{name}, enfrentamos dificuldades no Six Invitational 2022, mas logo depois conquistamos a LATAM Major 2022 – somos resilientes! 💥"
    ];
    return getRandomFromArray(replies).replace("{name}", getUserName(name));
  }

  if (/(jogos|ao vivo|acompanhar|assistir|ver).*(rainbow|r6|rainbow six)/.test(normalized)) {
    const replies = [
      "As transmissões de Rainbow Six variam bastante, mas a gente sempre te atualiza no nosso Insta: https://www.instagram.com/furia.r6/ 🕵️‍♂️💣",
      "{name}, quer acompanhar os jogos de R6 da FURIA? Segue a gente no Instagram pra ficar por dentro de tudo: https://www.instagram.com/furia.r6/ 🔥🎮"
    ];
    return getRandomFromArray(replies).replace("{name}", getUserName(name));
  }

  // FURIA FC

  if (/(comecou|estreou|iniciou|inicio|estreia|comeco).*(futebol|furia fc|fut)/.test(normalized)) {
    const replies = [
      "A FURIA estreou no cenário do futebol em 2025, participando da Kings League – um começo cheio de energia e grandes expectativas! ⚽🔥",
      "{name}, nosso time de futebol começou a jornada na Kings League em 2025, e já estamos com tudo! 🚀"
    ];
    return getRandomFromArray(replies).replace("{name}", getUserName(name));
  }

  if (/(furia|futebol|furia fc).*(estreou|iniciou|comecou).*(kings)/.test(normalized)) {
    const replies = [
      "Nossa estreia na Kings League aconteceu em 2025 – um marco importante para o futebol da FURIA! ⚽🏆",
      "{name}, a FURIA começou sua trajetória na Kings League em 2025 – um time pronto para crescer e conquistar! 💥"
    ];
    return getRandomFromArray(replies).replace("{name}", getUserName(name));
  }

  if (/(maior|principal|melhor|importante).*(conquista|trofeu|titulo).*(futebol|furia fc|fut)/.test(normalized)) {
    const replies = [
      "Ainda não conquistamos títulos, mas estamos treinando pesado para alçar voos altos e conquistar grandes troféus! 💪🏆",
      "{name}, ainda não temos um título, mas estamos em constante evolução e treinando forte para conquistar a Kings League! ⚽🔥"
    ];
    return getRandomFromArray(replies).replace("{name}", getUserName(name));
  }

  if (/(furia|futebol|fut).*(venceu|ganhou|conquistou).*(kings)/.test(normalized)) {
    const replies = [
      "Já temos grandes vitórias na Kings League, mas estamos batalhando para conquistar grandes feitos no futuro! 🔥⚽",
      "{name}, o time está com a meta de conquistar vitórias importantes na Kings League. Fique ligado nas nossas próximas partidas! 💥"
    ];
    return getRandomFromArray(replies).replace("{name}", getUserName(name));
  }

  if (/(furia|futebol|fut).*(melhor|maior|mais longe).*(colocacao|resultado).*(kings)/.test(normalized)) {
    const replies = [
      "Como o time está em sua temporada de estreia, estamos focados em melhorar a cada jogo para alcançar nosso melhor desempenho na Kings League! ⚽💪",
      "{name}, ainda estamos construindo nossa história na Kings League, e cada jogo é uma oportunidade de alcançar a nossa melhor colocação! 🔥"
    ];
    return getRandomFromArray(replies).replace("{name}", getUserName(name));
  }

  if (/(ultima|ultimo|recente).*(conquista|titulo|trofeu).*(futebol|furia fc|fut)/.test(normalized)) {
    const replies = [
      "Nossa última conquista ainda está por vir, mas estamos com uma equipe forte e foco total na Kings League! 💥🏆",
      "{name}, nossa última conquista será a próxima! Estamos treinando forte para brilhar na Kings League em breve! ⚽🔥"
    ];
    return getRandomFromArray(replies).replace("{name}", getUserName(name));
  }

  if (/(jogadores atuais|elenco atual|time atual|jogadores|elenco|line|lineup).*(futebol|furia fc|fut)/.test(normalized)) {
    const replies = [
      "O elenco atual da FURIA FC é formado por grandes talentos, como Guilherme Monagatti, Caio Catroca, Murillo Donato, Ryam Lima, Matheus Ayosa, João Pelegrini, Gabriel Pastuch, Victor Hugo, Matheus Dedo, Jeffinho, Lipão, Leleti e Andrey batata. A equipe é comandada pelo treinador Carlos Eduardo. Juntos, estamos prontos para brilhar na Kings League! ⚽🔥",
      "{name}, o time da FURIA FC conta com jogadores de peso como Guilherme Monagatti, Caio Catroca, Murillo Donato, Ryam Lima, Matheus Ayosa, João Pelegrini, Gabriel Pastuch, Victor Hugo, Matheus Dedo, Jeffinho, Lipão, Leleti e Andrey batata. A equipe é comandada pelo treinador Carlos Eduardo. Prontos para enfrentar todos os desafios na Kings League! 💥 Quer saber mais sobre o elenco? Clica no link para conhecer cada um dos nossos craques: https://kingsleague.pro/pt/times/50-furia-fc e no no instagram: https://www.instagram.com/furia.football/"
    ];
    return getRandomFromArray(replies).replace("{name}", getUserName(name));
  }

  if (/(jogos|ao vivo|acompanhar|assistir|ver).*(futebol|furia fc|fut|kings)/.test(normalized)) {
    const replies = [
      "Você pode assistir aos jogos da FURIA FC na Kings League ao vivo pelo canal da liga na Twitch: https://www.twitch.tv/kingsleagueamericas, no YouTube do Casimiro: https://www.youtube.com/@CazeTV e principalmente na MadHouse TV com a nossa galera: https://www.youtube.com/@madhouse_tv 🎥⚽",
      "{name}, os jogos da Kings League são transmitidos ao vivo no canal oficial da Twitch: https://www.twitch.tv/kingsleagueamericas, no canal do Cazé: https://www.youtube.com/@CazeTV, e com a gente na MadHouse TV: https://www.youtube.com/@madhouse_tv aproveita e já se inscreve lá para não perder os próximos jogos! 🔴🔥"
    ];
    return getRandomFromArray(replies).replace("{name}", getUserName(name));
  }

  if (/(ingresso|ingressos|comprar|adquirir).*(fut|futebol|furia fc|kings)/.test(normalized)) {
    const replies = [
      "Você pode garantir seu ingresso para os jogos da Kings League Brasil através do site oficial da Eventim: https://www.eventim.com.br/artist/kings-league-brazil/?affiliate=KLG 🎟️🔥",
      "{name}, os ingressos estão disponíveis no site da Eventim! Corre lá e garanta sua presença: https://www.eventim.com.br/artist/kings-league-brazil/?affiliate=KLG ⚽🙌"
    ];
    return getRandomFromArray(replies).replace("{name}", getUserName(name));
  }

  // REDRAM

  if (/(quando|ano|estreia|estreou|comecou|inicio).*(furia).*(automobilismo|corrida|redram|porsche)/.test(normalized)) {
    const replies = [
      "A FURIA acelerou rumo a novas pistas em 2025, com a estreia da equipe FURIA Redram na Porsche Cup! 🏁🔥",
      "{name}, em 2025 a FURIA deu a largada no automobilismo com a equipe Redram, estreando na prestigiada Porsche Cup Brasil! 🚘💨"
    ];
    return getRandomFromArray(replies).replace("{name}", getUserName(name));
  }

  if (/(quem|piloto|pilotos|corre|dirige|membros).*(furia|redram|automobilismo|porsche)/.test(normalized)) {
    const replies = [
      "A FURIA Redram conta com dois grandes nomes nas pistas: o ator e piloto **Caio Castro**, e o experiente **Matheus Comparatto**, prontos para acelerar com garra! 🏎️🔥",
      "{name}, nossos pilotos na Porsche Cup são **Caio Castro** e **Matheus Comparatto** – talento e velocidade guiando a FURIA nas pistas! 🏁"
    ];
    return getRandomFromArray(replies).replace("{name}", getUserName(name));
  }

  if (/(furia|redram).*(ganhou|venceu|conquistou|campeao|titulo|corrida|vitoria).*(porsche|automobilismo)/.test(normalized)) {
    const replies = [
      "Ainda não vencemos nenhuma corrida na Porsche Cup, mas estamos acelerando forte para conquistar nosso primeiro pódio em breve! 🏁💪",
      "{name}, a FURIA Redram ainda busca sua primeira vitória, mas nossos pilotos estão focados e acelerando rumo ao topo! 🚀"
    ];
    return getRandomFromArray(replies).replace("{name}", getUserName(name));
  }

  if (/(o que|oque|qual|sobre).*(furia).*(redram|automobilismo|porsche)/.test(normalized)) {
    const replies = [
      "A FURIA Redram é a nova divisão de automobilismo da FURIA Esports, competindo na Porsche Cup com pilotos como Caio Castro e Matheus Comparatto. Um novo território, mas com a mesma garra! 🏎️🔥",
      "{name}, a FURIA Redram representa nossa entrada no mundo das corridas! Participamos da Porsche Cup com um time competitivo e cheio de atitude nas pistas! 🏁"
    ];
    return getRandomFromArray(replies).replace("{name}", getUserName(name));
  }

  if (/(acompanhar|ver|assistir|noticias|corridas|onde).*(redram|automobilismo|porsche)/.test(normalized)) {
    const replies = [
      "Você pode acompanhar a FURIA Redram pelas redes da FURIA, no Instagram da furia RedRam: https://www.instagram.com/furia.redram/, além de transmissões oficiais da Porsche Cup. Fica ligado que vem velocidade por aí! 📱🏎️",
      "{name}, quer acompanhar a FURIA Redram? Cola no nosso Insta: https://www.instagram.com/furia.redram/ e fique por dentro das corridas da Porsche Cup! Também tem novidades no site oficial da competição. 🚗💨"
    ];
    return getRandomFromArray(replies).replace("{name}", getUserName(name));
  }

  //Curiosidades

  // Neymar é presidente da FURIA FC
  if (/(neymar|ney|neymar jr).*(presidente|comanda|manda|chefia).*(furia fc|futebol|time)/.test(normalized)) {
    return "Sim! O Neymar Jr. é o presidente do time de futebol da FURIA na Kings League. Ele está envolvido diretamente com o projeto da FURIA FC! ⚽👑";
  }

  // Neymar é dono da FURIA?
  if (/(neymar|ney|neymar jr).*(é|eh)?\s?(dono|proprietário|manda na|manda em|manda na furia)/.test(normalized)) {
    return "O Neymar Jr. não é dono da FURIA, mas é presidente do time de futebol da organização, a FURIA FC, na Kings League! ⚽🔥";
  }

  // Neymar trabalha na FURIA?
  if (/(neymar|ney|neymar jr).*(trabalha|faz|atua|participa|faz parte).*(furia)/.test(normalized)) {
    return "O Neymar Jr. participa da FURIA como presidente da FURIA FC, nosso time de futebol na Kings League! Ele está presente nos bastidores e nas decisões estratégicas. 👑⚽";
  }

  // Neymar e a FURIA de forma genérica
  if (/(neymar|ney|neymar jr).*(furia)/.test(normalized)) {
    return "Neymar Jr. é presidente da FURIA FC, o time de futebol da FURIA na Kings League! Ele está ajudando a escrever uma nova história no esporte com a gente! ⚽🔥";
  }

  // Caio Castro e automobilismo / FURIA Redram
  if (/(caio castro|piloto|automobilismo|porsche|carro|corrida).*(furia|redram|porsche cup)/.test(normalized)) {
    return "O ator e piloto Caio Castro corre pela equipe FURIA Redram na Porsche Cup! É mais uma área onde mostramos a força da nossa marca! 🏎️🔥";
  }

  // FalleN e sua atuação na FURIA
  if (/(fallen|professor).*(furia|cs|csgo|cs2|counter-?strike).*(time|jogador|lineup|joga|faz parte)/.test(normalized)) {
    return "Sim, o FalleN – também conhecido como 'O Professor' – faz parte da line-up atual de CS2 da FURIA! Uma lenda das balas e da estratégia. 🎯🧠";
  }

  // FalleN está na FURIA? (versão genérica)
  if (/(fallen|professor).*(furia)/.test(normalized)) {
    return "O FalleN está na FURIA! Ele traz toda sua experiência e liderança para o time de CS2. 🧠🎮";
  }

  // Como a FURIA começou
  if (/(como|quando|origem|fundação|história|começou|começaram).*(furia)/.test(normalized)) {
    return "A FURIA foi fundada em 2017 por Jaime Pádua e André Akkari com o objetivo de transformar o cenário dos esports no Brasil e no mundo! 🚀🇧🇷";
  }

  // O que é FURIA
  if (/(o que|oque|oq|me fale|sobre|saber|me conta).*(furia)/.test(normalized)) {
    return "A FURIA é uma organização brasileira que atua nas modalidades de e-sports. Fundada em 2017, a FURIA possui o time de Counter-Strike que melhor desempenha nas competições internacionais mais recentes, sempre a frente nas colocações entre equipes do país. 🔥";
  }

  // Onde está localizada a FURIA
  if (/(onde|localizada|fica|sede|local|base).*(furia)/.test(normalized)) {
    return "A FURIA tem sede nos Estados Unidos, mas também possui forte presença no Brasil e times em ação no mundo todo! 🌍🔥";
  }

  // Quem são os fundadores da FURIA
  if (/(quem|fundador|criador|criou|fez).*(furia)/.test(normalized)) {
    return "A FURIA foi fundada por Jaime Pádua, ex-advogado e empresário, e André Akkari, campeão mundial de poker. Juntos, criaram uma potência nos esports! 🧠🎮";
  }

  // Significado do nome FURIA
  if (/(significado|nome|por que|porque|chama|furia).*(nome|significa|significação)/.test(normalized)) {
    return "O nome FURIA representa a intensidade, garra e espírito competitivo da organização em todas as frentes: esports, cultura e esporte tradicional! 💥🖤";
  }

  // Títulos da FURIA no geral
  if (/(todos os|quais|qual|principais|principal|maiores|maior|conquistas|consquista|titulo|titulos).*(conquistas|títulos|titulos|troféus|trofeus|titulo|conquista|trofeu).*(furia)/.test(normalized)) {
    const replies = [
      `Aqui vão as principais conquistas da FURIA em cada modalidade:

CS:GO/CS2 🖱️:
- ESL Challenger Melbourne 2023
- Elisa Invitational Fall 2021
- IEM New York NA 2020
- DreamHack Open Summer 2020
- ESL Pro League Season 12 North America
- ECS Season 7 North America

League of Legends 🧙:
- CBLOL 2020

VALORANT 🔫:
- VCT Challengers Stage 2 Brasil 2021

Rainbow Six Siege 🔫:
- Latin America League Season 11 (2021)

A FURIA mostra sua força em todas as arenas! 🦁🔥`
    ];
    return getRandomFromArray(replies);
  }

  // Curiosidade geral
  if (/(curiosidade|curiosidades|sabia|sabia que|informação|informações|fatos|fato|me conta mais sobre|me fala mais sobre).*(furia)/.test(normalized)) {
    const facts = [
      "Você sabia que a FURIA foi a primeira organização brasileira a investir pesado em conteúdo fora do jogo, com foco em cultura e lifestyle?",
      "Além dos esports, a FURIA também está presente no futebol, no automobilismo e até no mundo da moda! Se liga no nosso instagram: https://www.instagram.com/furia.apparel/",
      "O Neymar Jr. é presidente da FURIA FC, o time da organização na Kings League!",
      "A FURIA tem uma gaming house e estrutura profissional em Miami, nos Estados Unidos!",
      "A FURIA foi uma das primeiras organizações brasileiras a disputar campeonatos internacionais de CS:GO com frequência!",
      "A organização nasceu em 2017 e já representa o Brasil nos principais torneios de esports do mundo!",
      "O nome 'FURIA' representa a intensidade, ambição e força com que os times da organização encaram cada desafio.",
      "O Caio Castro pilota pela FURIA Redram na Porsche Cup, representando a equipe no automobilismo! 🏎️",
      "A FURIA já teve uma collab de moda com marcas como New Era e está sempre conectada à cena streetwear.",
      "Matheus Comparatto também pilota pela FURIA Redram na Porsche Cup, ao lado de Caio Castro!",
      "A FURIA possui elencos competitivos em diversas modalidades: CS2, LoL, Valorant, Rainbow Six, entre outras.",
      "Em 2025, a FURIA FC estreou na Kings League Americas, com partidas transmitidas no canal do Casimiro e na Twitch oficial!",
      "{name}, tu sabia que a FURIA foi eleita por dois anos consecutivos, em 2020 e 2021, como a melhor organização de esportes eletrônicos no Prêmio eSports Brasil? E em 2022, foi apontada como a quinta maior organização de esportes eletrônicos do mundo pelo portal norte-americano Nerd Street."
    ];
    return getRandomFromArray(facts);
  }

  //Perguntas sobre o app
  // Significado do nome FURIA
  if (/(politica de privacidade|termos|termos de uso|politica|termo|politicas de privacidade|politicas|termo de uso)./.test(normalized)) {
    return `Claro {name}, aqui estão os termos do app:
    1. Cadastro de Conta
    Para utilizar o Furia+, você deverá fornecer informações verdadeiras e atualizadas. Você é responsável por manter a confidencialidade da sua conta e senha.
    2. Privacidade
    Suas informações pessoais são importantes para nós. Elas serão utilizadas apenas conforme nossa política de privacidade, respeitando a LGPD (Lei Geral de Proteção de Dados).
    3. Exclusão de Conta
    Você pode solicitar a exclusão da sua conta a qualquer momento através da página de Perfil. Ao excluir sua conta, todos os seus dados serão permanentemente apagados dos nossos sistemas.
    4. Alterações nos Termos
    Podemos atualizar estes termos periodicamente. Recomendamos que você revise os termos regularmente para se manter informado sobre quaisquer alterações.
    5. Uso Indevido
    O uso indevido da plataforma, como tentativa de violação de segurança ou atos ilícitos, poderá resultar no encerramento imediato da conta.
    6. Contato
    Em caso de dúvidas entre em contato com o criado desse protótipo (jpedromergulhao.dev@gmail.com). Todos os emails de contato criados para o app são ficticios, eles foram criados apenas para fins ilustrativos.`;
  }

  if (/(foto de perfil|trocar foto|escolher outra foto|trocar imagem|imagem de perfil|escolher outra imagem|trocar a foto|trocar a imagem|escolher imagem|escolher foto|escolher a imagem|escolher a foto)./.test(normalized)) {
    return "Sim, você pode trocar sua foto de perfil clicando na sua foto de perfil na página <Link to='/perfil'>Perfil<Link>";
  }

  if (/(foto de perfil|trocar foto|escolher outra foto|trocar imagem|imagem de perfil|escolher outra imagem|trocar a foto|trocar a imagem|escolher imagem|escolher foto|escolher a imagem|escolher a foto)./.test(normalized)) {
    return "Sim, você pode trocar sua foto de perfil clicando na sua foto de perfil na página <Link to='/perfil'>Perfil<Link>";
  }

  if (/(deletar|como deletar|excluir|como excluir|apagar|como apagar|deletar conta|deletar perfil|deletar a conta|deletar o perfil|deletar a minha conta|deletar o meu perfil|deletar minha conta|deletar o meu perfil|apagar conta|apagar perfil|apagar a conta|apagar o perfil|apagar a minha conta|apagar o meu perfil|apagar minha conta|apagar o meu perfil|excluir conta|excluir perfil|excluir a conta|excluir o perfil|excluir a minha conta|excluir o meu perfil|excluir minha conta|excluir o meu perfil)./.test(normalized)) {
    return "{name}, para deletar sua conta você precisa ir até a página de perfil e clicar no botão deletar. Após isso você confirma e faz uma reautenticação. Mas lembre-se de que você irá perder todos os seus dados";
  }

  // Fallback geral
  return getRandomFromArray(fallbackMessages).replace("{name}", getUserName(name));
}
