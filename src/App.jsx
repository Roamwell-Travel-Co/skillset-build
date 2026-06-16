import { useState } from 'react'
import Sidebar from './components/Sidebar'
import TopBar from './components/TopBar'
import SkillPath from './components/SkillPath'
import RightPanel from './components/RightPanel'
import SkillbitOnboarding from './components/skillbit/SkillbitOnboarding'
import SkillbitLesson from './components/skillbit/SkillbitLesson'
import { useProgress } from './hooks/useProgress'
import { generateQuiz } from './services/generateQuiz'
import './App.css'

export default function App() {
  const [activePage, setActivePage]       = useState('learn')
  const [skillbitPhase, setSkillbitPhase] = useState('onboarding') // onboarding | loading | lesson
  const [tripInfo, setTripInfo]           = useState(null)
  const [questions, setQuestions]         = useState(null)
  const { progress, addLessonXP, DAILY_XP_GOAL } = useProgress()

  function handleNav(id) {
    setActivePage(id)
    if (id === 'skillbit') setSkillbitPhase('onboarding')
  }

  async function handleOnboardingComplete(info) {
    setTripInfo(info)
    setSkillbitPhase('loading')
    const qs = await generateQuiz(info.destination, info.interests, info.nativeLanguage)
    setQuestions(qs)
    setSkillbitPhase('lesson')
  }

  function handleLessonComplete(xpEarned) {
    addLessonXP(xpEarned)
    setSkillbitPhase('onboarding')
    setActivePage('learn')
  }

  return (
    <div className="app-layout">
      {skillbitPhase !== 'lesson' && skillbitPhase !== 'loading' && (
        <Sidebar activePage={activePage} onNav={handleNav} />
      )}

      {/* Learn page */}
      {activePage === 'learn' && (
        <div className="main-content">
          <TopBar progress={progress} />
          <div className="center-and-right">
            <SkillPath lessonsCompleted={progress.lessonsCompleted} />
            <RightPanel progress={progress} dailyXPGoal={DAILY_XP_GOAL} />
          </div>
        </div>
      )}

      {/* Skillbit — onboarding */}
      {activePage === 'skillbit' && skillbitPhase === 'onboarding' && (
        <SkillbitOnboarding onComplete={handleOnboardingComplete} />
      )}

      {/* Skillbit — AI generating quiz */}
      {activePage === 'skillbit' && skillbitPhase === 'loading' && (
        <QuizLoadingScreen destination={tripInfo?.destination} />
      )}

      {/* Skillbit — lesson */}
      {activePage === 'skillbit' && skillbitPhase === 'lesson' && (
        <SkillbitLesson
          tripInfo={tripInfo}
          questions={questions}
          onExit={() => { setSkillbitPhase('onboarding'); setActivePage('learn') }}
          onComplete={handleLessonComplete}
        />
      )}
    </div>
  )
}

/* ── Loading screen shown while Gemini generates the quiz ── */
function QuizLoadingScreen({ destination }) {
  return (
    <div className="quiz-loading">
      <img src="/bubbie.png" alt="Bubbie" className="quiz-loading-bubbie" />
      <div className="quiz-loading-spinner" />
      <p className="quiz-loading-title">Building your lesson…</p>
      <p className="quiz-loading-sub">
        Personalizing phrases for {destination || 'your trip'} ✈️
      </p>
    </div>
  )
}
