export const quizzes = {
  france: [
    {
      id: 1,
      type: 'translate',
      english: "Where is the museum?",
      phrase: "Où est le musée ?",
      audio: "Où est le musée",
      options: ["Où est le musée ?", "Où est la gare ?", "C'est combien ?", "Merci beaucoup"],
      correct: "Où est le musée ?",
      feedback: "Où = Where · musée = museum · est = is"
    },
    {
      id: 2,
      type: 'select-meaning',
      prompt: "café",
      audio: "café",
      options: ["coffee", "hello", "tea"],
      correct: "coffee",
      feedback: "Café = coffee — the essential French café order!"
    },
    {
      id: 3,
      type: 'tap-what-you-hear',
      audio: "Bonjour",
      phrase: "Bonjour",
      wordTiles: ["Bonjour", "merci", "s'il vous plaît"],
      correct: "Bonjour",
      feedback: "Bonjour = Hello — the first word every French speaker needs!"
    },
    {
      id: 4,
      type: 'complete-chat',
      prompt: "Bonjour !",
      promptAudio: "Bonjour",
      options: ["S'il vous plaît.", "Bonjour !"],
      correct: "Bonjour !",
      feedback: "Bonjour! = Hello! — respond in kind with a greeting!"
    },
    {
      id: 5,
      type: 'translate',
      english: "Two tickets to the Eiffel Tower, please",
      phrase: "Deux billets pour la Tour Eiffel, s'il vous plaît",
      audio: "Deux billets pour la Tour Eiffel, s'il vous plaît",
      options: [
        "Deux billets pour la Tour Eiffel, s'il vous plaît",
        "Où est la Tour Eiffel ?",
        "Combien coûte l'entrée ?",
        "Je voudrais visiter le musée"
      ],
      correct: "Deux billets pour la Tour Eiffel, s'il vous plaît",
      feedback: "Deux = Two · billets = tickets · s'il vous plaît = please"
    },
    {
      id: 6,
      type: 'select-meaning',
      prompt: "merci",
      audio: "merci",
      options: ["thank you", "excuse me", "please"],
      correct: "thank you",
      feedback: "Merci = Thank you — always be grateful in French!"
    },
    {
      id: 7,
      type: 'tap-what-you-hear',
      audio: "s'il vous plaît",
      phrase: "s'il vous plaît",
      wordTiles: ["s'il vous plaît", "bonjour", "merci"],
      correct: "s'il vous plaît",
      feedback: "S'il vous plaît = Please — use it to be polite everywhere!"
    },
    {
      id: 8,
      type: 'complete-chat',
      prompt: "Excusez-moi, où est le métro ?",
      promptAudio: "Excusez-moi, où est le métro",
      options: ["Le métro est là-bas.", "Bonjour, je m'appelle..."],
      correct: "Le métro est là-bas.",
      feedback: "Là-bas = over there — essential for giving directions!"
    },
  ]
}
