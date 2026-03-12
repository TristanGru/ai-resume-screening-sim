import { useNavigate } from 'react-router-dom'
import { useAppContext } from '../context/AppContext.jsx'
import TrajectoryChart from '../components/TrajectoryChart.jsx'
import styles from '../styles/SummaryPage.module.css'

function buildTradeoffCallout(moveHistory) {
  if (moveHistory.length < 2) return 'No changes made.'

  const first = moveHistory[0].results
  const last = moveHistory[moveHistory.length - 1].results

  let maxPosDelta = null
  let maxNegDelta = null

  for (const firstResult of first) {
    const lastResult = last.find((r) => r.screenerID === firstResult.screenerID)
    if (!lastResult) continue
    const delta = lastResult.score - firstResult.score
    if (maxPosDelta === null || delta > maxPosDelta.delta) {
      maxPosDelta = { name: firstResult.name, delta }
    }
    if (maxNegDelta === null || delta < maxNegDelta.delta) {
      maxNegDelta = { name: firstResult.name, delta }
    }
  }

  if (!maxPosDelta || !maxNegDelta) return 'No changes made.'
  if (maxPosDelta.delta === 0 && maxNegDelta.delta === 0) {
    return 'Your scores did not change across all moves.'
  }

  const parts = []
  if (maxPosDelta.delta > 0) {
    parts.push(`${maxPosDelta.name} improved the most (+${maxPosDelta.delta} pts)`)
  }
  if (maxNegDelta.delta < 0) {
    parts.push(`${maxNegDelta.name} dropped the most (${maxNegDelta.delta} pts)`)
  }

  if (parts.length === 0) return 'Scores shifted but with no net gain.'
  return parts.join(', and ') + '.'
}

const TAKEAWAYS = [
  {
    title: 'Why screeners conflict',
    body: '[PLACEHOLDER] Different ATS systems use different algorithms. What looks like keyword optimisation to one screener may appear as spam to another. This simulation demonstrates why "gaming the ATS" is not a reliable strategy.',
  },
  {
    title: 'The real cost of keyword stuffing',
    body: '[PLACEHOLDER] Adding many keywords may boost your match score but can trigger spam filters, reduce readability for human reviewers, and signal inauthenticity. Genuine experience described clearly outperforms keyword lists.',
  },
  {
    title: 'What ATS cannot measure',
    body: '[PLACEHOLDER] Automated screeners cannot evaluate communication skills, cultural fit, creativity, or real-world impact. They measure proxies — formatting, keywords, structure — that correlate weakly with job performance.',
  },
  {
    title: 'Equity concerns',
    body: '[PLACEHOLDER] Research shows that ATS systems can disadvantage candidates whose education or experience follows non-traditional paths, whose names or addresses trigger biases, or who lack access to resume-coaching resources.',
  },
]

export default function SummaryPage() {
  const { state, dispatch } = useAppContext()
  const navigate = useNavigate()
  const { moveHistory } = state

  const firstRun = moveHistory[0]
  const lastRun = moveHistory[moveHistory.length - 1]
  const tradeoffCallout = buildTradeoffCallout(moveHistory)
  const totalMoves = moveHistory.length - 1

  function handleStartOver() {
    dispatch({ type: 'RESET' })
    navigate('/')
  }

  return (
    <div className={styles.page}>

      <header className={styles.header}>
        <p className={styles.eyebrow}>Simulation complete</p>
        <h2 className={styles.pageTitle}>Session Summary</h2>
        <p className={styles.meta}>
          <span className={styles.metaStrong}>{totalMoves}</span> edit{totalMoves !== 1 ? 's' : ''} made
          {' · '}Final Robust Score:{' '}
          <span className={styles.metaStrong}>{lastRun.robustScore}</span>
        </p>
      </header>

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
                        color:
                          delta > 0
                            ? 'var(--positive)'
                            : delta < 0
                            ? 'var(--negative)'
                            : 'var(--text-muted)',
                        fontWeight: 700,
                        fontVariantNumeric: 'tabular-nums',
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
      {/* TODO: REPLACE PLACEHOLDER — educational copy below should be replaced by team members after research */}
      <section className={styles.takeawaySection}>
        <p className={styles.sectionLabel}>Educational Takeaways</p>
        <div className={styles.takeaways}>
          {TAKEAWAYS.map((t, i) => (
            <div key={i} className={styles.takeaway}>
              <span className={styles.takeawayNum}>{String(i + 1).padStart(2, '0')}</span>
              <div className={styles.takeawayBody}>
                <h4>{t.title}</h4>
                <p>{t.body}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <div className={styles.actions}>
        <button className={styles.startOverBtn} onClick={handleStartOver}>
          ← Start Over
        </button>
      </div>
    </div>
  )
}
