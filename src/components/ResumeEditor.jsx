import styles from '../styles/ResumeEditor.module.css'

export default function ResumeEditor({ value, onChange, disabled, label }) {
  return (
    <div className={styles.editorWrap}>
      <label className={styles.editorLabel} htmlFor="resume-editor">
        {label ?? 'Edit your resume below:'}
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
