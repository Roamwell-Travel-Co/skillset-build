import { quizzes } from '../data/quizzes'

const API_URL = import.meta.env.DEV
  ? '/api/generate-quiz'
  : 'https://skillbit-quiz-api.app.withzero.ai/'

/* Calls the live Cloudflare Worker (prod) or local Vite plugin (dev). */
export async function generateQuiz(destination, interests, nativeLanguage = 'English') {
  try {
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ destination, interests, nativeLanguage }),
    })

    if (!res.ok) throw new Error(`API ${res.status}`)

    const { questions } = await res.json()
    if (!Array.isArray(questions) || questions.length === 0) {
      throw new Error('Empty questions array')
    }

    return questions
  } catch (err) {
    console.warn('[generateQuiz] Falling back to hardcoded quizzes:', err.message)
    // Graceful fallback — always have something to show
    return quizzes.france
  }
}
