import styles from '../styles/ScoreGauge.module.css'

/**
 * ScoreGauge renders a thin bar track with a threshold marker at 60 (passing).
 * Accepts an explicit `color` prop (from the screener identity) or falls back
 * to a score-based color.
 */
export default function ScoreGauge({ score, color }) {
  const pct = Math.max(0, Math.min(100, score))
  const fillColor = color || (score >= 75 ? '#166534' : score >= 50 ? '#b45309' : '#991b1b')

  return (
    <div className={styles.gauge}>
      <div className={styles.track}>
        <div
          className={styles.fill}
          style={{ width: `${pct}%`, backgroundColor: fillColor, opacity: 0.75 }}
        />
      </div>
    </div>
  )
}
