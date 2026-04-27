import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppContext } from '../context/AppContext.jsx'
import { ACHIEVEMENTS } from '../context/reducer.js'
import ScreenerCard from '../components/ScreenerCard.jsx'
import ResumeEditor from '../components/ResumeEditor.jsx'
import InfoModal from '../components/InfoModal.jsx'
import styles from '../styles/ResultsPage.module.css'

const SCREENER_COLORS = {
  s1: '#7b6ff0', s2: '#3eb489', s3: '#f4a93a', s4: '#5b8def', s5: '#e0567a',
}

const ROUNDS = {
  1: {
    title: 'Round 1 — Fix Structure',
    eyebrow: 'Quest 1 of 3',
    challenge:
      'Start with the ATS Parser. Real ATS systems fail to parse resumes that are missing standard sections, contact information, or date ranges — and a resume that cannot be read is automatically eliminated before anyone sees it. Add all four sections (Experience, Education, Skills, Projects), include your email and phone number, and make sure each role has a date range.',
    targetScreener: 's1',
    hint: 'Re-run and watch the ATS Parser score. Structure is the floor everything else builds on.',
  },
  2: {
    title: 'Round 2 — Match Keywords',
    eyebrow: 'Quest 2 of 3',
    challenge:
      'Now focus on Keyword Match. The screener looks for role-specific terms, but where they appear matters as much as whether they appear. A keyword buried in a standalone Skills list scores lower than the same keyword inside an Experience bullet — because context signals evidence, not just familiarity. Revise your bullets to include the language of the role you are targeting.',
    targetScreener: 's2',
    hint: 'Re-run and watch the Keyword Match card. Placement is not cosmetic — it changes the score.',
  },
  3: {
    title: 'Round 3 — Find the Balance',
    eyebrow: 'Quest 3 of 3',
    challenge:
      'This is where the system breaks down. Adding keywords improves your Keyword Match score and simultaneously flags your resume as stuffed by the Spam Risk screener. The two algorithms are working against each other using the same data. Try to hold your keyword gains without triggering the spam filter — and when you cannot, pay attention to why. This conflict is not a quirk of this simulation. It reflects how real ATS systems operate.',
    targetScreener: 's5',
    hint: 'Watch Keyword Match and Spam Risk together. When one goes up and the other goes down, that is the conflict working in real time.',
  },
}

export default function ResultsPage() {
  const { state, dispatch } = useAppContext()
  const navigate = useNavigate()
  const [infoOpen, setInfoOpen] = useState(false)
  const [conflictAlert, setConflictAlert] = useState(null)
  const [newAchievement, setNewAchievement] = useState(null)
  const prevAchievementsRef = useRef(state.achievements)

  const { moveHistory, gamePhase, currentRound, achievements, explorationMoves, currentResumeText } = state
  const currentMove = moveHistory[moveHistory.length - 1]
  const prevMove = moveHistory.length >= 2 ? moveHistory[moveHistory.length - 2] : null
  const isGuided = gamePhase === 'guided'
  const round = ROUNDS[currentRound]

  useEffect(() => {
    if (!prevMove) return
    const prevS2 = prevMove.results.find((r) => r.screenerID === 's2')?.score ?? 0
    const prevS5 = prevMove.results.find((r) => r.screenerID === 's5')?.score ?? 0
    const currS2 = currentMove.results.find((r) => r.screenerID === 's2')?.score ?? 0
    const currS5 = currentMove.results.find((r) => r.screenerID === 's5')?.score ?? 0

    if (currS2 > prevS2 && currS5 < prevS5) {
      setConflictAlert({
        type: 'keyword-up',
        msg: `Keyword Match rose +${currS2 - prevS2} pts while Spam Risk fell ${currS5 - prevS5} pts. The same keywords that improve your match score are flagging your resume as stuffed. These two screeners use the same text and reach opposite conclusions. That is a design conflict, not a mistake you made.`,
      })
    } else if (currS2 < prevS2 && currS5 > prevS5) {
      setConflictAlert({
        type: 'spam-up',
        msg: `Spam Risk rose +${currS5 - prevS5} pts while Keyword Match fell ${currS2 - prevS2} pts. Pulling back on keywords reduced your spam signal but cost you keyword alignment. You cannot fully satisfy both screeners at once — the system is not designed for that.`,
      })
    } else {
      setConflictAlert(null)
    }
  }, [currentMove, prevMove])

  useEffect(() => {
    const prev = prevAchievementsRef.current
    const newlyEarned = achievements.filter((a) => !prev.includes(a))
    if (newlyEarned.length > 0) {
      setNewAchievement(newlyEarned[newlyEarned.length - 1])
      const timer = setTimeout(() => setNewAchievement(null), 4000)
      return () => clearTimeout(timer)
    }
    prevAchievementsRef.current = achievements
  }, [achievements])

  function getDelta(screenerID) {
    if (!prevMove) return null
    const curr = currentMove.results.find((r) => r.screenerID === screenerID)
    const prev = prevMove.results.find((r) => r.screenerID === screenerID)
    if (!curr || !prev) return null
    return curr.score - prev.score
  }

  function handleReRun() {
    dispatch({ type: 'RERUN_SCREENERS' })
  }

  function handleEditorChange(text) {
    dispatch({ type: 'UPDATE_RESUME', payload: { resumeText: text } })
  }

  const moveLabel =
    moveHistory.length === 1
      ? '★ Baseline'
      : isGuided
      ? `Round ${currentRound - 1} Complete`
      : `Exploration · Edit ${explorationMoves}`

  return (
    <div className={styles.page}>
      <InfoModal isOpen={infoOpen} onClose={() => setInfoOpen(false)} />

      {/* ── Achievement toast ── */}
      {newAchievement && ACHIEVEMENTS[newAchievement] && (
        <div className={styles.achievementToast}>
          <span className={styles.toastIcon}>{ACHIEVEMENTS[newAchievement].icon}</span>
          <div>
            <div className={styles.toastLabel}>★ Achievement Unlocked</div>
            <div className={styles.toastName}>{ACHIEVEMENTS[newAchievement].label}</div>
            <div className={styles.toastDesc}>{ACHIEVEMENTS[newAchievement].desc}</div>
          </div>
        </div>
      )}

      {/* ── Top bar ── */}
      <div className={styles.topBar}>
        <div className={styles.topBarLeft}>
          <h2 className={styles.pageTitle}>Screening Results</h2>
          <span className={styles.moveLabel}>{moveLabel}</span>
          <button className={styles.infoBtn} onClick={() => setInfoOpen(true)}>
            About
          </button>
        </div>
        <div className={styles.topBarRight}>
          {achievements.length > 0 && (
            <div className={styles.achievementPips}>
              {achievements.map((a) => (
                <span key={a} className={styles.pip} title={ACHIEVEMENTS[a]?.label}>
                  {ACHIEVEMENTS[a]?.icon}
                </span>
              ))}
            </div>
          )}
          <button className={styles.summaryBtn} onClick={() => navigate('/summary')}>
            See Summary →
          </button>
        </div>
      </div>

      {/* ── Robust Score trophy card ── */}
      <div className={styles.robustScore}>
        <span className={styles.robustValue}>{currentMove.robustScore}</span>
        <div className={styles.robustMeta}>
          <span className={styles.robustLabel}>★ Robust Score</span>
          <span className={styles.robustNote}>
            Average of 5 screeners, penalized for spam risk (max −20 pts)
          </span>
        </div>
        <div className={styles.robustChips}>
          {currentMove.results.map((r) => (
            <span
              key={r.screenerID}
              className={styles.robustChip}
              style={{ '--screener-color': SCREENER_COLORS[r.screenerID] }}
              title={`${r.name}: ${r.score}`}
            >
              {r.score}
            </span>
          ))}
        </div>
      </div>

      {/* ── Round / Exploration banner ── */}
      {isGuided ? (
        <div className={styles.roundBanner}>
          <div className={styles.roundBannerLeft}>
            <span className={styles.roundEyebrow}>{round.eyebrow}</span>
            <h3 className={styles.roundTitle}>{round.title}</h3>
            <p className={styles.roundChallenge}>{round.challenge}</p>
            <p className={styles.roundHint}>★ {round.hint}</p>
          </div>
          <div className={styles.roundDots}>
            {[1, 2, 3].map((n) => (
              <span
                key={n}
                className={`${styles.dot} ${n < currentRound ? styles.dotDone : ''} ${n === currentRound ? styles.dotActive : ''}`}
              />
            ))}
          </div>
        </div>
      ) : (
        <div className={styles.explorationBanner}>
          <span className={styles.roundEyebrow} style={{ background: 'var(--positive-bg)', color: 'var(--positive)' }}>
            ★ Exploration Unlocked
          </span>
          <h3 className={styles.explorationTitle} style={{ marginTop: 8 }}>Keep going — no limits</h3>
          <p className={styles.explorationDesc}>
            You have completed all three guided rounds. Keep editing and re-running — there are more
            tradeoffs to find and more room to push your Robust Score. The leaderboard scores both
            your performance and what you uncovered.
          </p>
        </div>
      )}

      {/* ── Conflict callout ── */}
      {conflictAlert && (
        <div className={`${styles.conflictCallout} ${styles[conflictAlert.type]}`}>
          <span className={styles.conflictIcon}>⚡</span>
          <div>
            <strong className={styles.conflictHeading}>Conflict Detected</strong>
            <p className={styles.conflictMsg}>{conflictAlert.msg}</p>
          </div>
        </div>
      )}

      {/* ── Main layout: cards + editor ── */}
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
              isTargeted={isGuided && round.targetScreener === result.screenerID}
            />
          ))}
        </div>

        <div className={styles.editorPanel}>
          <p className={styles.editorHeading}>
            {isGuided ? `★ Round ${currentRound} — Edit & Re-Run` : '★ Exploration — Edit & Re-Run'}
          </p>
          <ResumeEditor value={currentResumeText} onChange={handleEditorChange} />
          <button className={styles.reRunBtn} onClick={handleReRun}>
            {isGuided ? `Complete Round ${currentRound} ▶` : 'Re-Run Screeners ▶'}
          </button>
          {!isGuided && (
            <p className={styles.explorationNote}>
              {explorationMoves} edit{explorationMoves !== 1 ? 's' : ''} ·{' '}
              {achievements.length} achievement{achievements.length !== 1 ? 's' : ''}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
