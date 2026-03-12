import styles from '../styles/DisclaimerBanner.module.css'

export default function DisclaimerBanner() {
  return (
    <div className={styles.banner} role="banner">
      <span>
        <strong>Educational Simulation:</strong> This is an educational simulation. Results do not
        reflect any real employer&apos;s screening system.
      </span>
    </div>
  )
}
