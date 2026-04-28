import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppContext } from '../context/AppContext.jsx'
import { ACHIEVEMENTS } from '../context/reducer.js'
import ScreenerCard from '../components/ScreenerCard.jsx'
import ResumeEditor from '../components/ResumeEditor.jsx'
import MoveTracker from '../components/MoveTracker.jsx'
import InfoModal from '../components/InfoModal.jsx'
import styles from '../styles/ResultsPage.module.css'

const SCREENER_COLORS = {
  s1: '#7b6ff0', s2: '#3eb489', s3: '#f4a93a', s4: '#5b8def', s5: '#e0567a',
}

const MAX_EXPLORATION_MOVES = 5

const ROUNDS = {
  1: {
    title: 'Round 1 — Structure & Keywords',
    eyebrow: 'Round 1 of 3',
    challenge:
      'Start by making sure your resume is structurally readable. Real ATS systems fail to parse resumes that are missing standard sections, contact information, or date ranges — and a resume that cannot be read is eliminated before any human sees it. Once structure looks solid, add role-specific keywords from the job description into your Experience bullets. A keyword buried in a Skills list counts for less than the same keyword used in an actual accomplishment sentence.',
    targetScreeners: ['s1', 's2'],
    hint: 'Re-run and watch ATS Parser and Keyword Match together. Structure is the floor — keywords are the first lever on top of it.',
  },
  2: {
    title: 'Round 2 — Role Signals & Impact',
    eyebrow: 'Round 2 of 3',
    challenge:
      'Now focus on role signals and bullet quality. The Seniority Fit screener looks for language that proves you understand the target role — words like "stakeholder," "dashboard," or "GitHub," depending on where you are applying. At the same time, the Impact screener rewards bullets that show what you accomplished, not just what you did. Use the formula: [Action Verb] + [what you did] + [a number or result].',
    targetScreeners: ['s3', 's4'],
    hint: 'Rewrite at least three bullets with a strong verb and one number each. Watch Seniority Fit and Impact Evidence move.',
  },
  3: {
    title: 'Round 3 — Find the Balance',
    eyebrow: 'Round 3 of 3',
    challenge:
      'This round surfaces the core tension. Adding more keywords improves your Keyword Match score and simultaneously flags your resume as stuffed by the Spam Risk screener. These two algorithms use the same text and reach opposite conclusions. Your goal: hold your keyword gains without triggering the spam filter. When you cannot, pay attention to why — this conflict is not a quirk of the simulation. It reflects how real ATS systems are built.',
    targetScreeners: ['s2', 's5'],
    hint: 'Watch Keyword Match and Spam Risk side by side. When one rises and the other drops, that is the conflict working in real time.',
  },
}

const ACHIEVEMENT_ORDER = [
  'structure_ace', 'keyword_master', 'right_fit', 'impact_star',
  'clean_climber', 'conflict_found', 'high_scorer', 'comeback', 'explorer',
]

export default function ResultsPage() {
  const { state, dispatch } = useAppContext()
  const navigate = useNavigate()
  const [infoOpen, setInfoOpen] = useState(false)
  const [conflictAlert, setConflictAlert] = useState(null)
  const [newAchievement, setNewAchievement] = useState(null)
  const prevAchievementsRef = useRef(state.achievements)

  const {
    moveHistory, gamePhase, currentRound, achievements,
    explorationMoves, explorationEdits, currentResumeText,
  } = state

  const currentMove = moveHistory[moveHistory.length - 1]
  const prevMove = moveHistory.length >= 2 ? moveHistory[moveHistory.length - 2] : null
  const isGuided = gamePhase === 'guided'
  const isExploration = gamePhase === 'exploration'
  const isComplete = gamePhase === 'complete'
  const round = ROUNDS[currentRound]
  const movesRemaining = MAX_EXPLORATION_MOVES - explorationMoves

  useEffect(() => {
    if (!prevMove) return
    const prevS2 = prevMove.results.find((r) => r.screenerID === 's2')?.score ?? 0
    const prevS5 = prevMove.results.find((r) => r.screenerID === 's5')?.score ?? 0
    const currS2 = currentMove.results.find((r) => r.screenerID === 's2')?.score ?? 0
    const currS5 = currentMove.results.find((r) => r.screenerID === 's5')?.score ?? 0

    if (currS2 > prevS2 && currS5 < prevS5) {
      setConflictAlert({
        type: 'keyword-up',
        msg: `Keyword Match rose +${currS2 - prevS2} pts while Spam Risk fell ${currS5 - prevS5} pts. The same keywords that improve your match score are flagging your resume as stuffed. Two screeners, same text, opposite conclusions — that is a design conflict, not a mistake you made.`,
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
    prevAchievementsRef.current = achievements

    if (newlyEarned.length > 0) {
      setNewAchievement(newlyEarned[newlyEarned.length - 1])
      const timer = setTimeout(() => setNewAchievement(null), 4000)
      return () => clearTimeout(timer)
    }

    setNewAchievement(null)
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
      : isComplete
      ? 'Exploration Complete'
      : `Exploration · Edit ${explorationEdits}`

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

      {/* ── Robust Score ── */}
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

      {/* ── Round / Exploration / Complete banner ── */}
      {isGuided && (
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
      )}

      {(isExploration || isComplete) && (
        <div className={styles.explorationBanner}>
          <div className={styles.explorationHeader}>
            <div>
              <span className={styles.roundEyebrow} style={{ background: 'var(--positive-bg)', color: 'var(--positive)' }}>
                ★ Exploration Mode
              </span>
              <h3 className={styles.explorationTitle}>
                {isComplete ? 'Exploration Complete — Time to Score' : `${movesRemaining} move${movesRemaining !== 1 ? 's' : ''} remaining`}
              </h3>
              <p className={styles.explorationDesc}>
                {isComplete
                  ? 'You have used all your exploration moves. Head to the summary to see your final score and leaderboard rank.'
                  : 'Hunt achievements to boost your leaderboard score. Each achievement adds bonus points on top of your Robust Score. You cannot get them all — choose your strategy.'}
              </p>
            </div>
            {!isComplete && (
              <MoveTracker movesRemaining={movesRemaining} />
            )}
          </div>

          {/* Achievement board */}
          <div className={styles.achievementBoard}>
            {ACHIEVEMENT_ORDER.map((id) => {
              const a = ACHIEVEMENTS[id]
              if (!a) return null
              const earned = achievements.includes(id)
              return (
                <div
                  key={id}
                  className={`${styles.achievementTile} ${earned ? styles.achievementEarned : styles.achievementLocked}`}
                >
                  <span className={styles.achievementIcon}>{a.icon}</span>
                  <div className={styles.achievementInfo}>
                    <span className={styles.achievementLabel}>{a.label}</span>
                    <span className={styles.achievementReq}>
                      {earned ? '✓ Earned' : a.requirement}
                    </span>
                  </div>
                  <span className={styles.achievementPoints}>+{a.points}</span>
                </div>
              )
            })}
          </div>
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
              isTargeted={isGuided && round.targetScreeners?.includes(result.screenerID)}
            />
          ))}
        </div>

        <div className={styles.editorPanel}>
          <p className={styles.editorHeading}>
            {isGuided
              ? `★ Round ${currentRound} — Edit, then Complete`
              : isComplete
              ? '★ Exploration Complete'
              : `★ Exploration — ${movesRemaining} move${movesRemaining !== 1 ? 's' : ''} left`}
          </p>
          <ResumeEditor
            value={currentResumeText}
            onChange={handleEditorChange}
            disabled={isComplete}
            label={isGuided ? `Edit your resume, then click Complete Round ${currentRound}:` : 'Edit your resume below:'}
          />

          {isComplete ? (
            <button className={styles.reRunBtn} onClick={() => navigate('/summary')}>
              See My Results →
            </button>
          ) : (
            <button className={styles.reRunBtn} onClick={handleReRun}>
              {isGuided ? `Complete Round ${currentRound} ▶` : 'Re-Run Screeners ▶'}
            </button>
          )}

          {isExploration && (
            <p className={styles.explorationNote}>
              {explorationEdits} edit{explorationEdits !== 1 ? 's' : ''} used · {explorationMoves} run{explorationMoves !== 1 ? 's' : ''} used ·{' '}
              {achievements.length} achievement{achievements.length !== 1 ? 's' : ''} earned
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
