import { useEffect } from 'react'
import styles from '../styles/InfoModal.module.css'

export default function InfoModal({ isOpen, onClose }) {
  useEffect(() => {
    if (!isOpen) return
    function handleKey(e) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div className={styles.overlay} onClick={onClose} role="dialog" aria-modal="true" aria-label="About this simulation">
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <button className={styles.closeBtn} onClick={onClose} aria-label="Close">
          ✕
        </button>
        <p className={styles.eyebrow}>About this tool</p>
        <h2>How the Simulation Works</h2>
        <p>
          <strong>ResumeSimulator</strong> runs your resume through five automated screening
          algorithms and shows you what each one sees. The scores frequently conflict — not
          by accident, but because different systems prioritize different signals.
        </p>
        <ul>
          <li>
            <strong>Five screeners, five different rules:</strong> ATS formatting, keyword
            matching, seniority fit, impact evidence, and spam detection. They do not agree
            on what a strong resume looks like.
          </li>
          <li>
            <strong>Three guided rounds, then open exploration:</strong> Edit your resume
            and re-run the screeners. Gaining on one screener often costs you on another.
            That tension is the point.
          </li>
          <li>
            <strong>Robust Score:</strong> An average of all five screeners with a spam
            penalty applied. A resume that games one algorithm at the expense of the others
            will not score well here.
          </li>
          <li>
            <strong>No real employer</strong> uses this exact system. It is a simulation,
            built to surface how ATS logic works and who it disadvantages.
          </li>
        </ul>
        <p>
          The goal is to understand AI-based hiring tools not just as technical systems, but
          as structures that shape access to opportunity — unequally.
        </p>
      </div>
    </div>
  )
}
