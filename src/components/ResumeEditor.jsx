import styles from '../styles/ResumeEditor.module.css'

export default function ResumeEditor({ value, onChange, disabled }) {
  return (
    <div className={styles.editorWrap}>
      <label className={styles.editorLabel} htmlFor="resume-editor">
        Edit your resume below, then click Re-Run:
      </label>
      <textarea
        id="resume-editor"
        className={styles.textarea}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        rows={18}
        spellCheck={false}
      />
    </div>
  )
}
