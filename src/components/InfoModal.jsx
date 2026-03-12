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
          <strong>ResumeSimulator</strong> shows you how automated resume screening systems
          evaluate resumes — and why their scores often conflict with each other.
        </p>
        <ul>
          <li>
            <strong>5 Screeners</strong> each apply different rules: ATS formatting, keyword
            matching, seniority fit, impact evidence, and spam detection.
          </li>
          <li>
            <strong>6 Moves:</strong> Edit your resume and re-run. Improving one screener
            can hurt another — that tension is the point.
          </li>
          <li>
            <strong>Robust Score:</strong> An overall score that penalizes high spam risk,
            showing how over-optimization backfires.
          </li>
          <li>
            <strong>No real employer</strong> uses this system. It is a learning tool only.
          </li>
        </ul>
        <p>
          The goal is to build critical intuition about AI-based hiring tools — their
          limitations, their conflicts, and who they may disadvantage.
        </p>
      </div>
    </div>
  )
}
