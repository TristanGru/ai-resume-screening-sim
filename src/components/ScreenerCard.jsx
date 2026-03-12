import ScoreGauge from './ScoreGauge.jsx'
import styles from '../styles/ScreenerCard.module.css'

const SCREENER_COLORS = {
  s1: '#3730a3',
  s2: '#166534',
  s3: '#b45309',
  s4: '#1d4ed8',
  s5: '#991b1b',
}

function DeltaBadge({ delta }) {
  if (delta === null || delta === undefined) return null
  const label = delta > 0 ? `+${delta}` : `${delta}`
  const cls = delta > 0 ? styles.deltaPos : delta < 0 ? styles.deltaNeg : styles.deltaZero
  return <span className={`${styles.delta} ${cls}`}>{label}</span>
}

export default function ScreenerCard({ screenerID, name, score, deductions, suggestion, delta }) {
  const color = SCREENER_COLORS[screenerID] || '#5c5852'

  return (
    <div className={styles.card} style={{ '--screener-color': color }}>
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
          <span className={styles.suggestionLabel}>Suggestion</span>
          {suggestion}
        </div>
      )}
    </div>
  )
}
