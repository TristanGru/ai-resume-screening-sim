import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppContext } from '../context/AppContext.jsx'
import { ACHIEVEMENTS } from '../context/reducer.js'
import { computeLeaderboardScore, getLeaderboard, addLeaderboardEntry } from '../utils/leaderboard.js'
import { BUNDLED_JD_LABELS } from '../data/bundledJDs.js'
import TrajectoryChart from '../components/TrajectoryChart.jsx'
import styles from '../styles/SummaryPage.module.css'

const ROLE_LABELS = {
  'data-analyst': 'Data Analyst',
  'software-engineer-intern': 'Software Engineer Intern',
  'business-analyst': 'Business Analyst',
}

function buildTradeoffCallout(moveHistory) {
  if (moveHistory.length < 2) return 'You did not make any edits. Edit the resume and re-run to see how your changes affect each screener.'

  const first = moveHistory[0].results
  const last = moveHistory[moveHistory.length - 1].results

  let maxPosDelta = null
  let maxNegDelta = null

  for (const firstResult of first) {
    const lastResult = last.find((r) => r.screenerID === firstResult.screenerID)
    if (!lastResult) continue
    const delta = lastResult.score - firstResult.score
    if (maxPosDelta === null || delta > maxPosDelta.delta) maxPosDelta = { name: firstResult.name, delta }
    if (maxNegDelta === null || delta < maxNegDelta.delta) maxNegDelta = { name: firstResult.name, delta }
  }

  if (!maxPosDelta || !maxNegDelta) return 'No changes made.'
  if (maxPosDelta.delta === 0 && maxNegDelta.delta === 0) return 'Your scores did not change between runs.'

  const parts = []
  if (maxPosDelta.delta > 0) parts.push(`${maxPosDelta.name} improved the most (+${maxPosDelta.delta} pts)`)
  if (maxNegDelta.delta < 0) parts.push(`${maxNegDelta.name} dropped the most (${maxNegDelta.delta} pts)`)
  if (parts.length === 0) return 'Scores shifted, but with no net change overall.'
  return parts.join(', and ') + '.'
}

const TAKEAWAYS = [
  {
    title: 'Why screeners conflict with each other',
    body: 'Different ATS vendors — Taleo, Workday, Greenhouse, iCIMS — use proprietary algorithms that prioritize different signals. A 2021 Harvard Business School study of 8,000 employers found that these systems vary so widely that a resume built for one can actively underperform in another. This simulation reproduces that tension by design: the Keyword Match screener rewards frequency while the Spam/Risk screener penalizes the same repetition as stuffing. The conflict between them is not a bug. It reflects how real hiring infrastructure operates.',
    citation: 'Fuller et al., "Hidden Workers: Untapped Talent," Harvard Business School / Accenture, 2021.',
  },
  {
    title: 'What keyword stuffing actually costs',
    body: 'A resume that passes ATS by loading keywords often fails with the human reviewer who reads it after. Research shows recruiters rate resumes with excessive skill lists as significantly less credible — even when the underlying experience is identical. Gaming the algorithm gets you through the filter. It does not get you the job. The competencies recruiters value most — communication, leadership, judgment — are exactly what a keyword list cannot demonstrate.',
    citation: 'ResumeGo, "ATS vs. Human Review," 2022; LinkedIn Global Talent Trends, 2023.',
  },
  {
    title: 'What ATS cannot measure',
    body: 'The same Harvard/Accenture study found that ATS systems automatically eliminate between 27% and 88% of qualified applicants before any human sees their resume — primarily due to formatting requirements or credential filters that have no relationship to job performance. The competencies employers consistently rate as most important — leadership, adaptability, communication — are exactly what keyword-matching algorithms cannot detect. The systems filter most aggressively on dimensions that matter least.',
    citation: 'Fuller et al., "Hidden Workers: Untapped Talent," Harvard Business School / Accenture, 2021.',
  },
  {
    title: 'Who this system disadvantages',
    body: 'ATS systems do not create inequity from scratch — they amplify existing inequities in hiring. Research from the National Bureau of Economic Research found that candidates with non-traditional career paths, employment gaps, or names statistically associated with minority groups receive systematically lower callback rates. ATS filters compound this by removing those candidates before any human judgment enters the process. Access to professional resume coaching is itself unequally distributed. Candidates without it are disproportionately excluded not because they are less qualified, but because they are less familiar with the formatting conventions an algorithm was built to reward.',
    citation: 'Kline, Rose & Walters, "Systemic Discrimination Among Large U.S. Employers," NBER Working Paper 29053, 2021.',
  },
]

export default function SummaryPage() {
  const { state, dispatch } = useAppContext()
  const navigate = useNavigate()
  const { moveHistory, achievements, role } = state

  const firstRun = moveHistory[0]
  const lastRun = moveHistory[moveHistory.length - 1]
  const tradeoffCallout = buildTradeoffCallout(moveHistory)
  const totalMoves = moveHistory.length - 1
  const finalScore = computeLeaderboardScore(lastRun.robustScore, achievements)
  const roleLabel = ROLE_LABELS[role] || role || 'Unknown Role'

  const [playerName, setPlayerName] = useState('')
  const [leaderboard, setLeaderboard] = useState(() => getLeaderboard(role))
  const [submitted, setSubmitted] = useState(false)

  function handleSubmitScore() {
    const trimmed = playerName.trim()
    if (!trimmed) return
    const newBoard = addLeaderboardEntry(trimmed, lastRun.robustScore, achievements, role)
    setLeaderboard(newBoard)
    setSubmitted(true)
  }

  function handleStartOver() {
    dispatch({ type: 'RESET' })
    navigate('/')
  }

  const myRank = submitted
    ? leaderboard.findIndex((e) => e.name === playerName.trim() && e.score === finalScore) + 1
    : null

  return (
    <div className={styles.page}>

      {/* ── Header ── */}
      <header className={styles.header}>
        <span className={styles.eyebrow}>★ Run Complete</span>
        <h2 className={styles.pageTitle}>Game Over</h2>
        <p className={styles.meta}>
          <span className={styles.metaStrong}>{totalMoves}</span> edit{totalMoves !== 1 ? 's' : ''}
          {' · '}Robust Score{' '}
          <span className={styles.metaStrong}>{lastRun.robustScore}</span>
          {achievements.length > 0 && (
            <>{' · '}<span className={styles.metaStrong}>{achievements.length}</span> achievement{achievements.length !== 1 ? 's' : ''}</>
          )}
          {' · '}<span className={styles.metaRole}>{roleLabel}</span>
        </p>
      </header>

      {/* ── Leaderboard ── */}
      <section className={styles.leaderboardSection}>
        <p className={styles.sectionLabel}>Final Score — {roleLabel} Leaderboard</p>
        <div className={styles.leaderboardCard}>
          <div className={styles.scoreBreakdown}>
            <span className={styles.finalScoreNum}>{finalScore}</span>
            <div className={styles.scoreBreakdownDetail}>
              <span className={styles.scoreBreakdownLabel}>Final Score</span>
              <span className={styles.scoreBreakdownNote}>
                Robust {lastRun.robustScore} + {finalScore - lastRun.robustScore} achievement pts
              </span>
            </div>
          </div>

          {!submitted ? (
            <div className={styles.submitRow}>
              <input
                className={styles.nameInput}
                type="text"
                placeholder="Enter your name for the leaderboard…"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSubmitScore()}
                maxLength={30}
              />
              <button
                className={styles.submitBtn}
                onClick={handleSubmitScore}
                disabled={!playerName.trim()}
              >
                Submit ▶
              </button>
            </div>
          ) : (
            <p className={styles.submittedMsg}>
              {myRank ? `★ You ranked #${myRank} on the ${roleLabel} leaderboard` : 'Score submitted!'}
            </p>
          )}

          {leaderboard.length > 0 && (
            <table className={styles.lbTable}>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Name</th>
                  <th>Score</th>
                  <th>Robust</th>
                  <th>★</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {leaderboard.map((entry, i) => (
                  <tr
                    key={i}
                    className={submitted && entry.name === playerName.trim() && entry.score === finalScore ? styles.myRow : ''}
                  >
                    <td className={styles.rank}>
                      {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : i + 1}
                    </td>
                    <td>{entry.name}</td>
                    <td style={{ fontWeight: 700 }}>{entry.score}</td>
                    <td>{entry.robustScore}</td>
                    <td>{entry.achievementCount}</td>
                    <td>{entry.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {leaderboard.length === 0 && !submitted && (
            <p className={styles.emptyLeaderboard}>
              No scores yet for {roleLabel}. Be the first to submit!
            </p>
          )}
        </div>
      </section>

      {/* ── Achievements earned ── */}
      {achievements.length > 0 && (
        <section className={styles.achievementsSection}>
          <p className={styles.sectionLabel}>Achievements Earned</p>
          <div className={styles.achievementGrid}>
            {achievements.map((id) => {
              const a = ACHIEVEMENTS[id]
              if (!a) return null
              return (
                <div key={id} className={styles.achievementBadge}>
                  <span className={styles.badgeIcon}>{a.icon}</span>
                  <div className={styles.badgeBody}>
                    <span className={styles.badgeLabel}>{a.label}</span>
                    <span className={styles.badgeDesc}>{a.desc}</span>
                  </div>
                  <span className={styles.badgePoints}>+{a.points}</span>
                </div>
              )
            })}
          </div>
        </section>
      )}

      {/* ── Score trajectory ── */}
      <section className={styles.chartSection}>
        <h3 className={styles.chartTitle}>Score Trajectory</h3>
        <TrajectoryChart moveHistory={moveHistory} />
      </section>

      {/* ── Tradeoff analysis ── */}
      <section className={styles.tradeoffSection}>
        <p className={styles.sectionLabel}>Key Tradeoff</p>
        <div className={styles.tradeoffCallout}>{tradeoffCallout}</div>
        {moveHistory.length >= 2 && (
          <table className={styles.deltaTable}>
            <thead>
              <tr>
                <th>Screener</th>
                <th>Baseline</th>
                <th>Final</th>
                <th>Change</th>
              </tr>
            </thead>
            <tbody>
              {firstRun.results.map((r) => {
                const last = lastRun.results.find((x) => x.screenerID === r.screenerID)
                const delta = last ? last.score - r.score : 0
                return (
                  <tr key={r.screenerID}>
                    <td>{r.name}</td>
                    <td>{r.score}</td>
                    <td>{last?.score ?? '—'}</td>
                    <td
                      style={{
                        color: delta > 0 ? 'var(--positive)' : delta < 0 ? 'var(--negative)' : 'var(--text-muted)',
                        fontWeight: 700,
                      }}
                    >
                      {delta > 0 ? `+${delta}` : delta}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </section>

      {/* ── Educational takeaways ── */}
      <section className={styles.takeawaySection}>
        <p className={styles.sectionLabel}>Educational Takeaways</p>
        <div className={styles.takeaways}>
          {TAKEAWAYS.map((t, i) => (
            <div key={i} className={styles.takeaway}>
              <span className={styles.takeawayNum}>{String(i + 1).padStart(2, '0')}</span>
              <div className={styles.takeawayBody}>
                <h4>{t.title}</h4>
                <p>{t.body}</p>
                <p className={styles.citation}>{t.citation}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <div className={styles.actions}>
        <button className={styles.startOverBtn} onClick={handleStartOver}>
          ← Play Again
        </button>
      </div>
    </div>
  )
}
