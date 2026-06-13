import { useState } from 'react'
import Sidebar from './components/Sidebar'
import TopBar from './components/TopBar'
import SkillPath from './components/SkillPath'
import RightPanel from './components/RightPanel'
import SkillbitOnboarding from './components/skillbit/SkillbitOnboarding'
import SkillbitLesson from './components/skillbit/SkillbitLesson'
import { useProgress } from './hooks/useProgress'
import './App.css'

export default function App() {
  const [activePage, setActivePage]   = useState('learn')
  const [skillbitPhase, setSkillbitPhase] = useState('onboarding')
  const [tripInfo, setTripInfo]       = useState(null)
  const { progress, addLessonXP, DAILY_XP_GOAL } = useProgress()

  function handleNav(id) {
    setActivePage(id)
    if (id === 'skillbit') setSkillbitPhase('onboarding')
  }

  function handleOnboardingComplete(info) {
    setTripInfo(info)
    setSkillbitPhase('lesson')
  }

  function handleLessonComplete(xpEarned) {
    addLessonXP(xpEarned)
    setSkillbitPhase('onboarding')
    setActivePage('learn')
  }

  return (
    <div className="app-layout">
      {skillbitPhase !== 'lesson' && (
        <Sidebar activePage={activePage} onNav={handleNav} />
      )}

      {activePage === 'learn' && (
        <div className="main-content">
          <TopBar progress={progress} />
          <div className="center-and-right">
            <SkillPath lessonsCompleted={progress.lessonsCompleted} />
            <RightPanel progress={progress} dailyXPGoal={DAILY_XP_GOAL} />
          </div>
        </div>
      )}

      {activePage === 'skillbit' && skillbitPhase === 'onboarding' && (
        <SkillbitOnboarding onComplete={handleOnboardingComplete} />
      )}

      {activePage === 'skillbit' && skillbitPhase === 'lesson' && (
        <SkillbitLesson
          tripInfo={tripInfo}
          onExit={() => setSkillbitPhase('onboarding')}
          onComplete={handleLessonComplete}
        />
      )}
    </div>
  )
}
