import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppContext } from '../context/AppContext.jsx'
import ScreenerCard from '../components/ScreenerCard.jsx'
import MoveTracker from '../components/MoveTracker.jsx'
import ResumeEditor from '../components/ResumeEditor.jsx'
import InfoModal from '../components/InfoModal.jsx'
import styles from '../styles/ResultsPage.module.css'

function getRobustColor(score) {
  if (score >= 75) return 'var(--positive)'
  if (score >= 50) return 'var(--s3-color)'
  return 'var(--negative)'
}

export default function ResultsPage() {
  const { state, dispatch } = useAppContext()
  const navigate = useNavigate()
  const [infoOpen, setInfoOpen] = useState(false)

  const { moveHistory, movesRemaining, currentResumeText } = state
  const currentMove = moveHistory[moveHistory.length - 1]
  const prevMove = moveHistory.length >= 2 ? moveHistory[moveHistory.length - 2] : null
  const isExhausted = movesRemaining === 0

  function getDelta(screenerID) {
    if (!prevMove) return null
    const curr = currentMove.results.find((r) => r.screenerID === screenerID)
    const prev = prevMove.results.find((r) => r.screenerID === screenerID)
    if (!curr || !prev) return null
    return curr.score - prev.score
  }

  function handleReRun() {
    if (isExhausted) return
    dispatch({ type: 'RERUN_SCREENERS' })
  }

  function handleEditorChange(text) {
    dispatch({ type: 'UPDATE_RESUME', payload: { resumeText: text } })
  }

  const robustColor = getRobustColor(currentMove.robustScore)
  const moveLabel = moveHistory.length === 1 ? 'Baseline' : `Move ${currentMove.moveIndex}`

  return (
    <div className={styles.page}>
      <InfoModal isOpen={infoOpen} onClose={() => setInfoOpen(false)} />

      <div className={styles.topBar}>
        <div className={styles.topBarLeft}>
          <h2 className={styles.pageTitle}>Screening Results</h2>
          <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>{moveLabel}</span>
          <button className={styles.infoBtn} onClick={() => setInfoOpen(true)}>
            About this tool
          </button>
        </div>
        <div className={styles.topBarRight}>
          <MoveTracker movesRemaining={movesRemaining} />
          <button className={styles.summaryBtn} onClick={() => navigate('/summary')}>
            See Summary →
          </button>
        </div>
      </div>

      <div className={styles.robustScore} style={{ borderLeftColor: robustColor }}>
        <span className={styles.robustValue} style={{ color: robustColor }}>
          {currentMove.robustScore}
        </span>
        <span className={styles.robustLabel}>Robust Score</span>
        <span className={styles.robustNote}>
          Mean of 5 screeners, penalised for spam risk (max −20 pts)
        </span>
      </div>

      <div className={styles.layout}>
        <div className={styles.cardsGrid}>
          {currentMove.results.map((result) => (
            <ScreenerCard
              key={result.screenerID}
              screenerID={result.screenerID}
              name={result.name}
              score={result.score}
              deductions={result.deductions}
              suggestion={result.suggestion}
              delta={getDelta(result.screenerID)}
            />
          ))}
        </div>

        <div className={styles.editorPanel}>
          <p className={styles.editorHeading}>Edit &amp; Re-Run</p>
          <ResumeEditor
            value={currentResumeText}
            onChange={handleEditorChange}
            disabled={isExhausted}
          />
          <button
            className={styles.reRunBtn}
            onClick={handleReRun}
            disabled={isExhausted}
          >
            Re-Run Screeners · {movesRemaining} move{movesRemaining !== 1 ? 's' : ''} left
          </button>
          {isExhausted && (
            <p className={styles.exhaustedMsg}>
              All 6 moves used.{' '}
              <button className={styles.summaryLink} onClick={() => navigate('/summary')}>
                View your summary →
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
