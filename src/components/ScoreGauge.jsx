import styles from '../styles/ScoreGauge.module.css'

export default function ScoreGauge({ score, color }) {
  const pct = Math.max(0, Math.min(100, score))
  const fillColor = color || (score >= 75 ? 'var(--positive)' : score >= 50 ? 'var(--s3-color)' : 'var(--negative)')

  return (
    <div className={styles.gauge}>
      <div className={styles.track}>
        <div
          className={styles.fill}
          style={{ width: `${pct}%`, backgroundColor: fillColor }}
        />
      </div>
    </div>
  )
}
