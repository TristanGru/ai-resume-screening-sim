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

      <header className={styles.header}>
        <p className={styles.eyebrow}>AI &amp; Humanity — Interactive Tool</p>
        <h1 className={styles.title}>ResumeSimulator</h1>
        <p className={styles.subtitle}>
          See how five automated screening algorithms score your resume — and discover
          why optimising for one can hurt another.
        </p>
        <button className={styles.infoBtn} onClick={() => setInfoOpen(true)}>
          How this simulation works →
        </button>
      </header>

      <div className={styles.form}>
        <div className={styles.row}>
          <div className={styles.field}>
            <label htmlFor="role-select" className={styles.label}>
              Target Role <span className={styles.required}>*</span>
            </label>
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

          <div className={styles.field}>
            <label htmlFor="sample-select" className={styles.label}>
              Or load a sample resume
            </label>
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
          <label htmlFor="resume-input" className={styles.label}>
            Resume Text <span className={styles.required}>*</span>{' '}
            <span className={styles.hint}>(plain text · min 50 chars)</span>
          </label>
          <textarea
            id="resume-input"
            className={styles.textarea}
            rows={16}
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
          <label htmlFor="jd-input" className={styles.label}>
            Job Description{' '}
            <span className={styles.hint}>(optional · feeds Keyword Match screener)</span>
          </label>
          <textarea
            id="jd-input"
            className={styles.textarea}
            rows={5}
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
          <button
            className={styles.runBtn}
            onClick={handleRunScreeners}
            disabled={isDisabled}
          >
            Run Screeners →
          </button>
          {isDisabled && (
            <p className={styles.disabledHint}>
              {!role
                ? 'Select a target role to continue.'
                : 'Resume must be at least 50 characters.'}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
