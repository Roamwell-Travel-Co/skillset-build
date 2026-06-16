import './SkillPath.css'

function nodeClass(index, lessonsCompleted) {
  if (lessonsCompleted > index) return 'node--completed'
  if (lessonsCompleted === index) return 'node--active'
  return 'node--locked'
}

function nodeIcon(index, emoji, lessonsCompleted) {
  if (lessonsCompleted > index) return <span>✓</span>
  if (lessonsCompleted === index) return <span>{emoji}</span>
  return <span className="node-icon-locked">{emoji}</span>
}

export default function SkillPath({ lessonsCompleted = 0 }) {
  return (
    <div className="skill-path">
      <div className="path-container">

        {/* Node 1 — right */}
        <div className="path-row path-row--right">
          <div className="node-wrapper">
            <div className="start-label">START</div>
            <div className={`node ${nodeClass(0, lessonsCompleted)}`}>
              {nodeIcon(0, '⭐', lessonsCompleted)}
            </div>
          </div>
        </div>

        <div className="path-dots path-dots--r2l" />

        {/* Node 2 — left */}
        <div className="path-row path-row--left">
          <div className={`node ${nodeClass(1, lessonsCompleted)}`}>
            {nodeIcon(1, '⭐', lessonsCompleted)}
          </div>
        </div>

        <div className="path-dots path-dots--down" />

        {/* Chest + Owl mascot */}
        <div className="chest-bubbie-row">
          <div className="chest-box">
            <div className="chest-lid" />
            <div className="chest-body" />
          </div>
          <img src="/bubbie.png" alt="Owl" className="bubbie-path" />
        </div>

        <div className="path-dots path-dots--down" />

        {/* Node 3 — left */}
        <div className="path-row path-row--left">
          <div className={`node ${nodeClass(2, lessonsCompleted)}`}>
            {nodeIcon(2, '⭐', lessonsCompleted)}
          </div>
        </div>

        <div className="path-dots path-dots--l2r" />

        {/* Node 4 — center */}
        <div className="path-row path-row--center">
          <div className={`node ${nodeClass(3, lessonsCompleted)}`}>
            {nodeIcon(3, '🏆', lessonsCompleted)}
          </div>
        </div>

      </div>
      <div className="bottom-strip">
        <span className="bottom-line" />
        Say what languages are spoken
        <span className="bottom-line" />
      </div>
    </div>
  )
}
