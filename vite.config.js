import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { spawnSync } from 'child_process'

/* ── AI Quiz Generation API ───────────────────────────────────────
   POST /api/generate-quiz { destination, interests }
   Calls Gemini 2.5 Flash via Zero CLI and returns quiz JSON array. */
function quizApiPlugin() {
  return {
    name: 'quiz-api',
    configureServer(server) {
      server.middlewares.use('/api/generate-quiz', (req, res) => {
        if (req.method !== 'POST') {
          res.statusCode = 405
          res.end('Method Not Allowed')
          return
        }

        const chunks = []
        req.on('data', chunk => chunks.push(chunk))
        req.on('end', () => {
          try {
            const { destination, interests, nativeLanguage = 'English' } = JSON.parse(Buffer.concat(chunks).toString())
            const prompt = buildQuizPrompt(destination, interests, nativeLanguage)
            const payload = JSON.stringify({ messages: [{ role: 'user', content: prompt }] })

            // spawnSync avoids all shell-escaping issues with complex payloads
            const result = spawnSync(
              'zero',
              ['fetch', 'https://x402-gateway-production.up.railway.app/api/llm/gemini-flash', '-X', 'POST', '-d', payload],
              { encoding: 'utf8', timeout: 90000 }
            )

            if (result.error) throw result.error
            const raw = (result.stdout || '') + (result.stderr || '')

            // Zero output: payment messages, then the JSON response on its own line
            const jsonLine = raw.split('\n').find(l => l.trim().startsWith('{'))
            if (!jsonLine) throw new Error('No JSON response from Zero/Gemini')

            const geminiResponse = JSON.parse(jsonLine)
            const content = geminiResponse.content

            // Clean up common Gemini quirks before parsing
            const cleaned = content
              .replace(/```(?:json)?\s*/gi, '') // strip markdown code fences
              .replace(/```/g, '')
              .replace(/\\'/g, "'")              // \' is invalid JSON escape
              // Replace any URL values in audio/promptAudio fields with empty string.
              // Gemini sometimes emits fake URLs; the URL may also contain a stray
              // escaped-quote (\") that breaks JSON parsing entirely.
              .replace(/"(audio|promptAudio)"\s*:\s*"https?:\/\/(?:[^"\\]|\\.)*"/g, '"$1": ""')
              // Gemini sometimes emits a literal " instead of ' for word-internal
              // apostrophes (e.g. s"il → s'il). Replace " between two letters with '.
              .replace(/([a-zA-ZÀ-ÿ])"([a-zA-ZÀ-ÿ])/g, "$1'$2")
              .trim()

            const match = cleaned.match(/\[[\s\S]*\]/)
            if (!match) throw new Error('No JSON array in Gemini response')

            let questions
            try {
              questions = JSON.parse(match[0])
            } catch (parseErr) {
              // Response was truncated — recover by trimming to last complete object
              const lastClose = match[0].lastIndexOf('\n  }')
              if (lastClose < 0) throw parseErr
              const recovered = match[0].slice(0, lastClose + 4) + '\n]'
              questions = JSON.parse(recovered)
              console.warn(`[quiz-api] Truncated response — recovered ${questions.length} questions`)
            }
            questions.forEach((q, i) => {
              q.id = i + 1
              // Sanitize: if Gemini put a URL in audio fields, replace with plain text fallback
              if (q.audio && /^https?:\/\//i.test(q.audio))   q.audio = q.phrase || q.prompt || ''
              if (q.promptAudio && /^https?:\/\//i.test(q.promptAudio)) q.promptAudio = q.prompt || ''
            })

            res.setHeader('Content-Type', 'application/json')
            res.setHeader('Access-Control-Allow-Origin', '*')
            res.end(JSON.stringify({ questions }))
          } catch (err) {
            console.error('[quiz-api] Error:', err.message)
            res.statusCode = 500
            res.end(JSON.stringify({ error: err.message }))
          }
        })
      })
    }
  }
}

function buildQuizPrompt(destination, interests, nativeLanguage = 'English') {
  return `You are a language quiz builder for the travel app SkillBit.

Destination: "${destination}"
User's native language: "${nativeLanguage}"
User interests: "${interests}"

NATIVE-LANGUAGE-FIRST RULE — this is the most important rule and overrides everything else:
The user's native language is ${nativeLanguage}. Every question must show ${nativeLanguage} FIRST so the user understands what they are being asked, then show the foreign language they are learning.

Apply this rule to each question type:
- "translate": "english" MUST be a complete sentence written in ${nativeLanguage} (e.g. if nativeLanguage is Spanish, write the sentence in Spanish). The 4 "options" are all in the destination language. The user reads ${nativeLanguage} and picks the matching foreign translation.
- "select-meaning": "prompt" is one foreign word or short phrase. ALL "options" MUST be written in ${nativeLanguage} — the user picks the ${nativeLanguage} meaning of the foreign word.
- "tap-what-you-hear": "audio", "phrase", and "wordTiles" are all in the destination language. "feedback" MUST be written in ${nativeLanguage} explaining what was heard.
- "complete-chat": "prompt" is what a local says (in the destination language). "options" are foreign-language replies the user can choose. "feedback" MUST start with the ${nativeLanguage} translation of both the prompt and the correct reply so the user understands what happened.

Return a JSON array of EXACTLY 8 quiz questions. Go DEEP on ONE specific travel scene (e.g. "ordering at a café") relevant to the destination and interests. Build from easy to hard. Stop at exactly 8 — do not exceed this.

CRITICAL: You must use EXACTLY these field names. Any deviation breaks the app.

QUESTION TYPE 1 — "translate"
Pick ONE correct translation and THREE wrong ones. ALL four go in "options".
{
  "type": "translate",
  "english": "One coffee, please.",
  "phrase": "Un café, s'il vous plaît.",
  "audio": "Un café s'il vous plaît",
  "options": ["Un café, s'il vous plaît.", "Deux cafés, merci.", "L'addition, s'il vous plaît.", "Bonjour monsieur."],
  "correct": "Un café, s'il vous plaît.",
  "feedback": "Un = One · café = coffee · s'il vous plaît = please"
}

QUESTION TYPE 2 — "select-meaning"
Show one foreign word/phrase, user picks the English meaning.
{
  "type": "select-meaning",
  "prompt": "l'addition",
  "audio": "l'addition",
  "options": ["the bill", "the menu", "the tip"],
  "correct": "the bill",
  "feedback": "L'addition = the bill — say this when ready to pay!"
}

QUESTION TYPE 3 — "tap-what-you-hear"
User hears the audio and taps the matching word from a small bank.
{
  "type": "tap-what-you-hear",
  "audio": "Merci beaucoup",
  "phrase": "Merci beaucoup",
  "wordTiles": ["Merci beaucoup", "s'il vous plaît", "bonjour"],
  "correct": "Merci beaucoup",
  "feedback": "Merci beaucoup = Thank you very much!"
}

QUESTION TYPE 4 — "complete-chat"
A local says something to the user. User picks the correct reply from exactly 2 options.
{
  "type": "complete-chat",
  "prompt": "Vous désirez ?",
  "promptAudio": "Vous désirez",
  "options": ["Un café crème, s'il vous plaît.", "Bonne nuit !"],
  "correct": "Un café crème, s'il vous plaît.",
  "feedback": "Vous désirez = What would you like? The waiter is taking your order!"
}

RULES:
- Use the destination's correct language (Japan → Japanese, Spain → Spanish, France → French, etc.)
- "audio" and "promptAudio" MUST be plain spoken text ONLY — for example: "Bonjour" or "Un café s'il vous plaît". NEVER a URL, file path, or anything starting with http. The browser reads these strings aloud directly using text-to-speech.
- Include at least 2 of type "tap-what-you-hear" and at least 2 of type "complete-chat"
- "complete-chat" must be real travel situations: waiter taking order, paying the bill, asking for directions, buying a ticket
- Do NOT use escaped single quotes like \\' inside strings — use regular apostrophes or reword
- Do NOT wrap the output in markdown code fences
- Return ONLY the raw JSON array starting with [ and ending with ]`
}

export default defineConfig({
  plugins: [react(), quizApiPlugin()],
})
