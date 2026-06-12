import { useState } from 'react'
import Sidebar from './components/Sidebar'
import TopBar from './components/TopBar'
import SkillPath from './components/SkillPath'
import RightPanel from './components/RightPanel'
import SkillbitOnboarding from './components/skillbit/SkillbitOnboarding'
import SkillbitLesson from './components/skillbit/SkillbitLesson'
import './App.css'

export default function App() {
  const [activePage, setActivePage]   = useState('learn')
  const [skillbitPhase, setSkillbitPhase] = useState('onboarding') // onboarding | lesson
  const [tripInfo, setTripInfo]       = useState(null)

  function handleNav(id) {
    setActivePage(id)
    if (id === 'skillbit') setSkillbitPhase('onboarding')
  }

  function handleOnboardingComplete(info) {
    setTripInfo(info)
    setSkillbitPhase('lesson')
  }

  return (
    <div className="app-layout">
      {/* Sidebar always visible unless inside a lesson */}
      {skillbitPhase !== 'lesson' && (
        <Sidebar activePage={activePage} onNav={handleNav} />
      )}

      {/* Learn page */}
      {activePage === 'learn' && (
        <div className="main-content">
          <TopBar />
          <div className="center-and-right">
            <SkillPath />
            <RightPanel />
          </div>
        </div>
      )}

      {/* Skillbit — onboarding */}
      {activePage === 'skillbit' && skillbitPhase === 'onboarding' && (
        <SkillbitOnboarding onComplete={handleOnboardingComplete} />
      )}

      {/* Skillbit — lesson (full screen, no sidebar) */}
      {activePage === 'skillbit' && skillbitPhase === 'lesson' && (
        <SkillbitLesson
          tripInfo={tripInfo}
          onExit={() => setSkillbitPhase('onboarding')}
        />
      )}
    </div>
  )
}
