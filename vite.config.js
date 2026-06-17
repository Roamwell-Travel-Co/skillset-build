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
  return `You are a language coach building a quiz for the travel app SkillBit.

USER INFO:
- Native language: ${nativeLanguage}
- Traveling to: ${destination}
- Interests / context: ${interests}

YOUR JOB:
Detect the primary language spoken at "${destination}" — that is the TARGET LANGUAGE for this lesson.
The user already speaks ${nativeLanguage}. Teach them the TARGET LANGUAGE through 8 quiz questions.

CORE RULE — ${nativeLanguage} ALWAYS COMES FIRST:
Every question must show the user something in ${nativeLanguage} BEFORE showing the target language, so they always understand what they are learning. This applies in every field described below.

QUESTION TYPES — use ALL four types across the 8 questions, with at least 2 of types 3 and 4:

TYPE 1 — "translate"
The user reads a sentence in ${nativeLanguage} and picks the correct target-language translation.
Fields:
  "type": "translate"
  "instruction": a short phrase in ${nativeLanguage} that means "Translate this sentence" — write it in ${nativeLanguage}
  "english": the sentence the user needs to translate, written entirely in ${nativeLanguage}
  "phrase": the correct target-language translation (used for context only)
  "audio": the target-language phrase spoken aloud — plain text only, no URLs
  "options": array of 4 strings — all in the target language — 1 correct + 3 plausible wrong answers
  "correct": must exactly match one of the options
  "feedback": word-by-word breakdown in ${nativeLanguage} explaining what each word means

TYPE 2 — "select-meaning"
The user sees a single target-language word or short phrase and picks its meaning in ${nativeLanguage}.
Fields:
  "type": "select-meaning"
  "instruction": a short phrase in ${nativeLanguage} that means "What does this word mean?"
  "prompt": one target-language word or short phrase
  "audio": same as prompt — plain text only, no URLs
  "options": array of 3 strings — ALL written in ${nativeLanguage} — 1 correct + 2 plausible wrong
  "correct": the correct ${nativeLanguage} meaning, must match one of the options exactly
  "feedback": written in ${nativeLanguage} — explain the word and give a memory tip

TYPE 3 — "tap-what-you-hear"
The user hears a target-language phrase and taps it from a small word bank.
Fields:
  "type": "tap-what-you-hear"
  "instruction": a short phrase in ${nativeLanguage} that means "Tap what you hear"
  "audio": the target-language phrase to be spoken — plain text only, no URLs
  "phrase": same as audio
  "wordTiles": array of 3–4 target-language choices including the correct one
  "correct": must exactly match one of the wordTiles
  "feedback": written in ${nativeLanguage} — translate and explain what was heard

TYPE 4 — "complete-chat"
A local speaks to the user in the target language. The user picks the correct reply.
Fields:
  "type": "complete-chat"
  "instruction": a short phrase in ${nativeLanguage} that means "How do you respond?"
  "prompt": what the local says — written in the target language (a real travel situation: ordering, paying, directions, etc.)
  "promptAudio": same as prompt — plain text only, no URLs
  "options": array of exactly 2 target-language replies — 1 correct + 1 wrong
  "correct": must exactly match one of the options
  "feedback": written entirely in ${nativeLanguage} — first translate what the local said, then explain what the correct reply means

OUTPUT RULES:
- Detect destination language automatically — never default to a wrong language
- "audio" and "promptAudio" are spoken aloud by the browser: plain text only, no URLs, no file paths, no punctuation like ? or !
- Build from easy (single words, greetings) to harder (full sentences, situational replies)
- Do NOT use escaped apostrophes \\' — use a regular apostrophe or rephrase
- Do NOT wrap output in markdown code fences
- Return ONLY a raw JSON array starting with [ and ending with ]
- Stop at exactly 8 questions`
}

export default defineConfig({
  plugins: [react(), quizApiPlugin()],
})
