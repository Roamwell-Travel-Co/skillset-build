import { quizzes } from '../data/quizzes'

/* Calls the Vite dev-server quiz API (or falls back to hardcoded quizzes). */
export async function generateQuiz(destination, interests) {
  try {
    const res = await fetch('/api/generate-quiz', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ destination, interests }),
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
