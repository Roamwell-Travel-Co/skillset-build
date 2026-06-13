import './SkillPath.css'

export default function SkillPath() {
  return (
    <div className="skill-path">
      <div className="path-container">

        {/* Node 1 — active, right */}
        <div className="path-row path-row--right">
          <div className="node-wrapper">
            <div className="start-label">START</div>
            <div className="node node--active">
              <span>⭐</span>
            </div>
          </div>
        </div>

        <div className="path-dots path-dots--r2l" />

        {/* Node 2 — locked, left */}
        <div className="path-row path-row--left">
          <div className="node node--locked">
            <span className="node-icon-locked">⭐</span>
          </div>
        </div>

        <div className="path-dots path-dots--down" />

        {/* Chest milestone */}
        <div className="chest-bubbie-row">
          <div className="chest-box">
            <div className="chest-lid" />
            <div className="chest-body" />
          </div>
        </div>

        <div className="path-dots path-dots--down" />

        {/* Node 3 — locked, left */}
        <div className="path-row path-row--left">
          <div className="node node--locked">
            <span className="node-icon-locked">⭐</span>
          </div>
        </div>

        <div className="path-dots path-dots--l2r" />

        {/* Node 4 — locked, center */}
        <div className="path-row path-row--center">
          <div className="node node--locked">
            <span className="node-icon-locked">🏆</span>
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
