const apiKeyInput = document.getElementById("apiKey");
const gameSelect = document.getElementById("gameSelect");
const questionInput = document.getElementById("questionInput");
const askButton = document.getElementById("askButton");
const form = document.getElementById("form");
const aiResponse = document.getElementById("aiResponse");

const markdownToHTML = (text) => {
  const converter = new showdown.Converter();
  return converter.makeHtml(text);
};

const perguntarAI = async (question, game, apiKey) => {
  const model = "gemini-2.0-flash";
  const geminiURL = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  const perguntaLOL = `
    ## Especialidade
    Você é um especialista assistente de meta para o jogo ${game}

    ## Tarefa
    Você deve responder as perguntas do usuário com base no seu
    conhecimento do jogo, estratégias, build e dicas

    ## Regras
    - Se você não sabe a resposta, responda com 'Não sei' e não
    tente inventar uma resposta.
    - Se a pergunta não está relacionada ao jogo, responda com
    'Essa pergunta não está relacionada ao jogo'
    - Considere a data atual ${new Date().toLocaleDateString()}
    - Faça pesquisas atualizadas sobre o patch atual, baseado na data atual, para dar uma resposta coerente.
    - Nunca responda itens que você não tem certeza de que existe no patch atual.

    ## Resposta
    - Economize na resposta, seja direto e responda no máximo 500 caracteres
    - Responda em markdown
    - Não precisa fazer nenhuma saudação ou despedida, apenas responda o que o usuário está querendo.

    ## Exemplo de resposta
    pergunta do usuário: Melhor build rengar jungle
    resposta: A build mais atual é:  \n\n **Itens:**\n\n coloque os itens aqui. \n\n**Runas:\n\nexemplo de runas\n\n

    ---
    Aqui está a pergunta do usuário: ${question}
    `;

  const perguntaESO = `
    ## Especialidade
    Você é um especialista assistente de meta para o jogo ${game}

    ## Tarefa
    Você deve responder as perguntas do usuário com base no seu
    conhecimento do jogo, estratégias, build e dicas

    ## Regras
    - Se você não sabe a resposta, responda com 'Não sei' e não
    tente inventar uma resposta.
    - Itens e palavras-chave do jogo devem ser mantidos no idioma inglês, mas todo o resto deve seguir o mesmo idioma com que a pergunta foi feita, como o português-br.
    - Se a pergunta não está relacionada ao jogo, responda com
    'Essa pergunta não está relacionada ao jogo'
    - Considere a data atual ${new Date().toLocaleDateString()}
    - Faça pesquisas atualizadas sobre o update atual, baseado na data atual, para dar uma resposta coerente.
    - Nunca responda sets ou itens com atributos que você não tem certeza de que existe no update atual.

    ## Resposta
    - Seja direto, informe onde os sets são obtidos, quais são e quais armas vão em cada mão,os Champion Points(cp) sejam as ativas ou passivas, se possível divida em partes como. 300cp-600cp-900cp-1200cp para atender jogadores de diferentes níveis., 3 melhores raças para a build, porções e alimentos, skills e árvores de skille que seja uma build que use 2 barras(12 skills ativas), ou apenas uma(6 skills ativas), coloque todas as passivas a serem usadas e responda no máximo 2000 caracteres
    -Leve o sistema de subclasses em consideração
    -Em caso de pergunta pouco explicativa, informe para que uso a build é mais adequada, como single target ou multi target em caso de dps de grupo
    - Responda em markdown
    - Não precisa fazer nenhuma saudação ou despedida, apenas responda o que o usuário está querendo.

    ## Exemplo de resposta
    pergunta do usuário: Melhor build para dps Arcanista de grupo
    resposta: A build mais atual é:  \n\n **Raça:**\n\n coloque as 3 melhores raças aqui.\n\n **Sets:**\n\n coloque os equipamentos e armas aqui,. \n\n**Skills:**\n\n coloque as árvores de skill e as skills aqui. \n\n**CP:**\n\n coloque os champions points aqui\n\n**Porções:**\n\ncoloque melhores alimentos e porções aqui. \n\n**Rotação**\n\ncoloque a rotação da build(s) aqui

    ---
    Aqui está a pergunta do usuário: ${question}
    `;

  let pergunta = "";
  //exemplo
  if (game == "lol") {
    pergunta = perguntaLOL;
  } else if (game == "eso") {
    pergunta = perguntaESO;
  }

  const contents = [
    {
      role: "user",
      parts: [
        {
          text: pergunta,
        },
      ],
    },
  ];

  const tools = [
    {
      google_search: {},
    },
  ];

  const response = await fetch(geminiURL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      contents,
      tools,
    }),
  });

  const data = await response.json();
  return data.candidates[0].content.parts[0].text;
};

const enviarFormulario = async (event) => {
  event.preventDefault();
  const apiKey = apiKeyInput.value;
  const game = gameSelect.value;
  const question = questionInput.value;

  if (apiKey == "" || game == "" || question == "") {
    alert("Por favor, preencha todos os campos");
    return;
  }

  askButton.disabled = true;
  askButton.textContent = "Perguntando...";
  askButton.classList.add("loading");

  try {
    const text = await perguntarAI(question, game, apiKey);
    aiResponse.querySelector(".response-content").innerHTML =
      markdownToHTML(text);
    aiResponse.classList.remove("hidden");
  } catch (error) {
    console.log("Erro: ", error);
  } finally {
    askButton.disabled = false;
    askButton.textContent = "Perguntar";
    askButton.classList.remove("loading");
  }
};

form.addEventListener("submit", enviarFormulario);
