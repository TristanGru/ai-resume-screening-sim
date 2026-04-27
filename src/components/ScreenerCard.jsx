import ScoreGauge from './ScoreGauge.jsx'
import styles from '../styles/ScreenerCard.module.css'

const SCREENER_COLORS = {
  s1: '#7b6ff0',
  s2: '#3eb489',
  s3: '#f4a93a',
  s4: '#5b8def',
  s5: '#e0567a',
}

function DeltaBadge({ delta }) {
  if (delta === null || delta === undefined) return null
  const label = delta > 0 ? `▲ +${delta}` : delta < 0 ? `▼ ${delta}` : '— 0'
  const cls = delta > 0 ? styles.deltaPos : delta < 0 ? styles.deltaNeg : styles.deltaZero
  return <span className={`${styles.delta} ${cls}`}>{label}</span>
}

export default function ScreenerCard({ screenerID, name, score, deductions, suggestion, delta, isTargeted }) {
  const color = SCREENER_COLORS[screenerID] || 'var(--text)'

  return (
    <div className={`${styles.card} ${isTargeted ? styles.targeted : ''}`} style={{ '--screener-color': color }}>
      <div className={styles.header}>
        <h3 className={styles.name}>{name}</h3>
        <DeltaBadge delta={delta} />
      </div>

      <div className={styles.scoreBlock}>
        <span className={styles.scoreNumber}>{score}</span>
        <span className={styles.scoreSlash}>/100</span>
      </div>

      <div className={styles.gaugeWrap}>
        <ScoreGauge score={score} color={color} />
      </div>

      <ul className={styles.deductions}>
        {deductions.map((d, i) => (
          <li key={i}>{d}</li>
        ))}
      </ul>

      {suggestion && (
        <div className={styles.suggestion}>
          <span className={styles.suggestionLabel}>★ Suggestion</span>
          {suggestion}
        </div>
      )}
    </div>
  )
}
