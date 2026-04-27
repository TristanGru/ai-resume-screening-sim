import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppContext } from '../context/AppContext.jsx'
import { STARTER_RESUMES } from '../data/sampleResumes.js'
import { BUNDLED_JDS } from '../data/bundledJDs.js'
import InfoModal from '../components/InfoModal.jsx'
import styles from '../styles/InputPage.module.css'

const ROLES = [
  { value: 'data-analyst', label: 'Data Analyst' },
  { value: 'software-engineer-intern', label: 'Software Engineer Intern' },
  { value: 'business-analyst', label: 'Business Analyst' },
]

const SCREENERS = [
  { id: 's1', label: 'ATS Parser', color: 'var(--s1-color)' },
  { id: 's2', label: 'Keyword Match', color: 'var(--s2-color)' },
  { id: 's3', label: 'Seniority Fit', color: 'var(--s3-color)' },
  { id: 's4', label: 'Impact Evidence', color: 'var(--s4-color)' },
  { id: 's5', label: 'Spam Risk', color: 'var(--s5-color)' },
]

const ROUNDS = [
  { num: 1, title: 'Structure & Keywords', desc: "Make the parser happy, speak the role's language" },
  { num: 2, title: 'Role Signals & Impact', desc: 'Prove you fit, show what you achieved' },
  { num: 3, title: 'Find the Balance', desc: 'Win without triggering spam' },
]

export default function InputPage() {
  const { state, dispatch } = useAppContext()
  const navigate = useNavigate()
  const [infoOpen, setInfoOpen] = useState(false)

  const resumeText = state.currentResumeText
  const role = state.role

  const isDisabled = resumeText.trim().length < 50 || !role

  function handleRoleChange(value) {
    dispatch({ type: 'SET_ROLE', payload: { role: value || null } })
    if (value) {
      const currentText = state.currentResumeText.trim()
      const isStarterOrEmpty =
        !currentText || Object.values(STARTER_RESUMES).some((r) => r.trim() === currentText)
      if (isStarterOrEmpty) {
        dispatch({ type: 'UPDATE_RESUME', payload: { resumeText: STARTER_RESUMES[value] } })
      }
    }
  }

  function handleRunScreeners() {
    dispatch({ type: 'RUN_SCREENERS', payload: { resumeText } })
    navigate('/results')
  }

  return (
    <div className={styles.page}>
      <InfoModal isOpen={infoOpen} onClose={() => setInfoOpen(false)} />

      {/* ── Top brand bar ── */}
      <div className={styles.topBar}>
        <div className={styles.brand}>
          <div className={styles.brandMark}>R</div>
          <div>
            <div className={styles.brandName}>ResumeSimulator</div>
            <div className={styles.brandSub}>AI &amp; Humanity</div>
          </div>
        </div>
        <button className={styles.infoBtn} onClick={() => setInfoOpen(true)}>
          How this works →
        </button>
      </div>

      {/* ── Hero + Quest ── */}
      <div className={styles.heroGrid}>
        <header className={styles.header}>
          <span className={styles.eyebrowChip}>★ Interactive Tool</span>
          <h1 className={styles.title}>
            Beat the <span className={styles.titleAccent}>algorithm</span>.<br />
            Or learn why you can&apos;t.
          </h1>
          <p className={styles.subtitle}>
            Five automated screeners evaluate your resume using different rules. Improving
            your score on one often means losing ground on another — that conflict is not a
            glitch. It is how the system works.
          </p>
          <div className={styles.screenerChips}>
            {SCREENERS.map((s) => (
              <span
                key={s.id}
                className={styles.screenerChip}
                style={{ '--screener-color': s.color }}
              >
                {s.label}
              </span>
            ))}
          </div>
        </header>

        <aside className={styles.questCard}>
          <span className={styles.questBadge}>★ Your Quest</span>
          <h2 className={styles.questTitle}>Three rounds. Then hunt achievements.</h2>
          <ol className={styles.questList}>
            {ROUNDS.map((q) => (
              <li key={q.num} className={styles.questItem}>
                <span className={styles.questNum}>{q.num}</span>
                <div>
                  <div className={styles.questItemTitle}>{q.title}</div>
                  <div className={styles.questItemDesc}>{q.desc}</div>
                </div>
              </li>
            ))}
          </ol>
          <div className={styles.explorationNote}>
            After round 3 → Exploration Mode: 5 moves to collect achievements and climb the leaderboard.
          </div>
        </aside>
      </div>

      {/* ── Form card ── */}
      <div className={styles.form}>
        <div className={styles.field}>
          <div className={styles.labelRow}>
            <label htmlFor="role-select" className={styles.label}>
              Target Role <span className={styles.required}>*</span>
            </label>
            <span className={styles.hint}>your starter resume loads automatically</span>
          </div>
          <select
            id="role-select"
            className={styles.select}
            value={role || ''}
            onChange={(e) => handleRoleChange(e.target.value || null)}
          >
            <option value="">Select a role…</option>
            {ROLES.map((r) => (
              <option key={r.value} value={r.value}>
                {r.label}
              </option>
            ))}
          </select>
        </div>

        {role && BUNDLED_JDS[role] && (
          <div className={styles.jdCallout}>
            <span className={styles.jdCalloutLabel}>★ You&apos;ll be scored against this job description</span>
            <p className={styles.jdCalloutText}>{BUNDLED_JDS[role]}</p>
          </div>
        )}

        <div className={styles.field}>
          <div className={styles.labelRow}>
            <label htmlFor="resume-input" className={styles.label}>
              Resume Text <span className={styles.required}>*</span>
            </label>
            <span className={styles.hint}>
              {role ? 'starter resume loaded — edit or replace it' : 'select a role first'}
            </span>
          </div>
          <textarea
            id="resume-input"
            className={styles.textarea}
            rows={16}
            value={resumeText}
            onChange={(e) =>
              dispatch({ type: 'UPDATE_RESUME', payload: { resumeText: e.target.value } })
            }
            placeholder={role ? 'Your starter resume will appear here…' : 'Select a role above to load your starter resume…'}
            spellCheck={false}
          />
          <span className={styles.charCount}>
            {resumeText.trim().length} chars
            {resumeText.trim().length < 50 && ` — need ${50 - resumeText.trim().length} more`}
          </span>
        </div>

        <hr className={styles.divider} />

        <div className={styles.ctaRow}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
            {!isDisabled && <span className={styles.readyChip}>● Ready to play</span>}
            {isDisabled && (
              <p className={styles.disabledHint}>
                {!role
                  ? 'Pick a target role to continue.'
                  : `Resume needs ${Math.max(0, 50 - resumeText.trim().length)} more chars.`}
              </p>
            )}
          </div>
          <button
            className={styles.runBtn}
            onClick={handleRunScreeners}
            disabled={isDisabled}
          >
            Run Screeners ▶
          </button>
        </div>
      </div>
    </div>
  )
}
