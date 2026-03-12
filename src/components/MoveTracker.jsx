import styles from '../styles/MoveTracker.module.css'

export default function MoveTracker({ movesRemaining }) {
  const isLow = movesRemaining <= 2
  const isEmpty = movesRemaining === 0

  return (
    <div className={`${styles.tracker} ${isLow ? styles.low : ''} ${isEmpty ? styles.empty : ''}`}>
      <span className={styles.count}>{movesRemaining}</span>
      <span className={styles.label}>
        {movesRemaining === 1 ? 'move remaining' : 'moves remaining'}
      </span>
      <div className={styles.pips}>
        {Array.from({ length: 6 }).map((_, i) => (
          <span
            key={i}
            className={`${styles.pip} ${i < movesRemaining ? styles.pipActive : styles.pipUsed}`}
          />
        ))}
      </div>
    </div>
  )
}
