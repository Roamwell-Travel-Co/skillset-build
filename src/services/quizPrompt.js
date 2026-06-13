/* ── Quiz generation prompt ───────────────────────────────────────
   This is the "rule" that tells Gemini how to build every lesson.
   It must stay consistent — the React quiz components depend on the
   exact JSON shape it produces. */

export function buildQuizPrompt(destination, interests) {
  return `You are a language-learning quiz designer for the app SkillBit, which is like Duolingo but focused on travel.

A user is traveling to: "${destination}"
Their interests/context: "${interests}"

Generate a single immersive language lesson — a JSON array of 10–14 quiz questions.
Go DEEP on the specific travel scenario suggested by the destination and interests.
Do NOT spread thinly across many topics. Pick one concrete scene (e.g. "ordering coffee at a Parisian café") and build the whole lesson around it, from easy to hard.

QUESTION TYPES — use a good MIX of all of these:

1. "translate" — Show the English sentence, user picks the correct translation.
   Fields: type, english, phrase, audio, options (array of 4), correct, feedback

2. "select-meaning" — Show a single foreign word/phrase, user picks the English meaning.
   Fields: type, prompt, audio, options (array of 3), correct, feedback

3. "tap-what-you-hear" — Audio plays, user taps the word/phrase they hear from a word bank.
   Fields: type, audio, phrase, wordTiles (array of 3–4 choices), correct (single word/phrase), feedback

4. "complete-chat" — Show a realistic chat message from a local, user picks the correct reply.
   Fields: type, prompt, promptAudio, options (array of 2), correct, feedback

RULES:
- All foreign phrases must be real, phonetically correct, and actually useful to a traveler.
- "audio" fields contain ONLY the foreign text (no punctuation like ? or !) — this gets spoken aloud by the browser.
- "feedback" explains the meaning word-by-word or gives a helpful memory tip. Keep it short.
- Build from EASY (greetings, single words) to HARDER (full sentences, situational replies).
- Include at least 2 "tap-what-you-hear" questions and at least 2 "complete-chat" questions.
- "complete-chat" scenarios must feel like REAL conversations: a waiter greeting you, asking for the bill, a shop owner saying the price, etc.
- For destinations where the main language is NOT French (e.g. Japan → Japanese, Spain → Spanish), use the correct language.
- Detect the destination's primary language automatically.

Return ONLY a valid JSON array — no markdown, no explanation, just the raw JSON.

Example of one question of each type (use these exact field names):

{ "id": 1, "type": "translate", "english": "One coffee, please.", "phrase": "Un café, s'il vous plaît.", "audio": "Un café, s'il vous plaît", "options": ["Un café, s'il vous plaît.", "Deux cafés, merci.", "L'addition, s'il vous plaît.", "Bonjour, monsieur."], "correct": "Un café, s'il vous plaît.", "feedback": "Un = One · café = coffee · s'il vous plaît = please" }

{ "id": 2, "type": "select-meaning", "prompt": "l'addition", "audio": "l'addition", "options": ["the bill", "the menu", "the tip"], "correct": "the bill", "feedback": "L'addition = the bill — say this when you're ready to pay!" }

{ "id": 3, "type": "tap-what-you-hear", "audio": "Merci beaucoup", "phrase": "Merci beaucoup", "wordTiles": ["Merci beaucoup", "s'il vous plaît", "bonjour"], "correct": "Merci beaucoup", "feedback": "Merci beaucoup = Thank you very much — always be grateful!" }

{ "id": 4, "type": "complete-chat", "prompt": "Vous désirez ?", "promptAudio": "Vous désirez", "options": ["Un café crème, s'il vous plaît.", "Bonne nuit !"], "correct": "Un café crème, s'il vous plaît.", "feedback": "Vous désirez = What would you like? — The waiter is taking your order!" }

Now generate the full lesson for: "${destination}" (interests: "${interests}"). Return ONLY the JSON array.`
}
