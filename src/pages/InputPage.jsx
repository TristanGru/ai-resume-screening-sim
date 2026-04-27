import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppContext } from '../context/AppContext.jsx'
import { sampleResumes } from '../data/sampleResumes.js'
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

const QUESTS = [
  { num: 1, title: 'Fix Structure', desc: 'Make the parser happy' },
  { num: 2, title: 'Match Keywords', desc: 'Speak the role’s language' },
  { num: 3, title: 'Find the Balance', desc: 'Win without triggering spam' },
]

export default function InputPage() {
  const { state, dispatch } = useAppContext()
  const navigate = useNavigate()
  const [infoOpen, setInfoOpen] = useState(false)

  const resumeText = state.currentResumeText
  const role = state.role
  const jdText = state.jdText

  const isDisabled = resumeText.trim().length < 50 || !role

  function handleRunScreeners() {
    dispatch({ type: 'RUN_SCREENERS', payload: { resumeText } })
    navigate('/results')
  }

  function handleSampleSelect(e) {
    const idx = parseInt(e.target.value, 10)
    if (!isNaN(idx) && sampleResumes[idx]) {
      dispatch({ type: 'UPDATE_RESUME', payload: { resumeText: sampleResumes[idx].text } })
    }
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
          <h2 className={styles.questTitle}>Three rounds. One impossible balance.</h2>
          <ol className={styles.questList}>
            {QUESTS.map((q) => (
              <li key={q.num} className={styles.questItem}>
                <span className={styles.questNum}>{q.num}</span>
                <div>
                  <div className={styles.questItemTitle}>{q.title}</div>
                  <div className={styles.questItemDesc}>{q.desc}</div>
                </div>
              </li>
            ))}
          </ol>
        </aside>
      </div>

      {/* ── Form card ── */}
      <div className={styles.form}>
        <div className={styles.row}>
          <div className={styles.field} style={{ marginBottom: 0 }}>
            <div className={styles.labelRow}>
              <label htmlFor="role-select" className={styles.label}>
                Target Role <span className={styles.required}>*</span>
              </label>
            </div>
            <select
              id="role-select"
              className={styles.select}
              value={role || ''}
              onChange={(e) =>
                dispatch({ type: 'SET_ROLE', payload: { role: e.target.value || null } })
              }
            >
              <option value="">Select a role…</option>
              {ROLES.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.field} style={{ marginBottom: 0 }}>
            <div className={styles.labelRow}>
              <label htmlFor="sample-select" className={styles.label}>
                Or load a sample
              </label>
            </div>
            <select
              id="sample-select"
              className={styles.select}
              defaultValue=""
              onChange={handleSampleSelect}
            >
              <option value="">Choose a sample…</option>
              {sampleResumes.map((s, i) => (
                <option key={i} value={i}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className={styles.field}>
          <div className={styles.labelRow}>
            <label htmlFor="resume-input" className={styles.label}>
              Resume Text <span className={styles.required}>*</span>
            </label>
            <span className={styles.hint}>plain text · min 50 chars</span>
          </div>
          <textarea
            id="resume-input"
            className={styles.textarea}
            rows={14}
            value={resumeText}
            onChange={(e) =>
              dispatch({ type: 'UPDATE_RESUME', payload: { resumeText: e.target.value } })
            }
            placeholder="Paste your resume text here…"
            spellCheck={false}
          />
          <span className={styles.charCount}>
            {resumeText.trim().length} chars
            {resumeText.trim().length < 50 && ` — need ${50 - resumeText.trim().length} more`}
          </span>
        </div>

        <div className={styles.field}>
          <div className={styles.labelRow}>
            <label htmlFor="jd-input" className={styles.label}>
              Job Description
            </label>
            <span className={styles.hint}>optional · feeds Keyword Match</span>
          </div>
          <textarea
            id="jd-input"
            className={styles.textarea}
            rows={4}
            value={jdText}
            onChange={(e) =>
              dispatch({ type: 'SET_JD', payload: { jdText: e.target.value } })
            }
            placeholder="Paste the job description to sharpen keyword matching…"
            spellCheck={false}
          />
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
