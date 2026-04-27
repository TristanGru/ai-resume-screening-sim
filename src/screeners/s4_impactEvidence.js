import { actionVerbs } from '../data/actionVerbs.js'

const RESULT_WORDS = [
  'increased', 'decreased', 'improved', 'reduced', 'saved', 'grew',
  'generated', 'achieved', 'delivered', 'launched', 'eliminated', 'accelerated',
  'boosted', 'cut', 'doubled', 'raised', 'streamlined', 'transformed',
]

const WEAK_PHRASES = [
  'responsible for', 'helped with', 'worked on', 'assisted with',
  'participated in', 'involved in', 'helped to', 'tasked with',
  'duties included', 'was part of',
]

/**
 * S4 — Impact & Evidence (Upgraded)
 * Analyzes each bullet point individually using the formula:
 *   Action Verb + Task/Context + Evidence/Metric + Result/Outcome
 * Rewards specific, quantified accomplishments over vague responsibility listings.
 */
export function s4_impactEvidence(resumeText) {
  try {
    const lines = resumeText.split('\n').map((l) => l.trim()).filter((l) => l.length > 5)

    // Extract bullet lines — the primary unit of analysis
    const bulletLines = lines.filter((l) => /^[•\-\*▪–]/.test(l))
    // Fall back to any content lines if no bullets found
    const contentLines =
      bulletLines.length > 0
        ? bulletLines
        : lines.filter((l) => l.length > 20 && !/^(experience|education|skills|projects|summary)/i.test(l))

    if (contentLines.length === 0) {
      return {
        screenerID: 's4',
        name: 'Impact & Evidence',
        score: 20,
        deductions: [
          'No bullet points or content lines found to analyze.',
          'Add bullet points to your Experience and Projects sections.',
        ],
        suggestion:
          'Add bullet points under each role using the formula: [Action Verb] + [what you did] + [metric or result].',
      }
    }

    const lowerActionVerbs = actionVerbs.map((v) => v.toLowerCase())

    let totalQuality = 0
    let strongBullets = 0
    let weakBulletCount = 0
    let quantifiedCount = 0
    let resultCount = 0

    for (const line of contentLines) {
      const stripped = line.replace(/^[•\-\*▪–\s]+/, '').trim()
      if (stripped.length < 10) continue

      const lower = stripped.toLowerCase()
      let bulletQuality = 0 // 0–4 scale

      // Component 1: Action verb — starts the bullet
      const firstWord = lower.split(/\s+/)[0]
      if (lowerActionVerbs.some((v) => firstWord.startsWith(v))) {
        bulletQuality++
      }

      // Component 2: Evidence/metric — contains a number or percentage
      if (/\d+/.test(stripped)) {
        bulletQuality++
        quantifiedCount++
      }

      // Component 3: Result indicator — shows the outcome/impact
      if (RESULT_WORDS.some((w) => lower.includes(w))) {
        bulletQuality++
        resultCount++
      }

      // Component 4: Context — bullet is substantive (not just a stub)
      if (stripped.length > 40) {
        bulletQuality++
      }

      // Weak phrase penalty — overrides partial credit
      if (WEAK_PHRASES.some((p) => lower.startsWith(p))) {
        bulletQuality = Math.max(0, bulletQuality - 2)
        weakBulletCount++
      }

      if (bulletQuality >= 3) strongBullets++
      totalQuality += bulletQuality
    }

    // Score: map average bullet quality (0–4) to 20–100
    const avgQuality = totalQuality / contentLines.length
    const score = Math.max(0, Math.min(100, Math.round(20 + (avgQuality / 4) * 80)))

    const deductions = []

    if (quantifiedCount === 0) {
      deductions.push(
        'No quantified achievements found. Add numbers, percentages, or metrics to show real impact (e.g., "reduced load time by 40%").'
      )
    } else if (quantifiedCount < contentLines.length * 0.3) {
      deductions.push(
        `Only ${quantifiedCount} of ${contentLines.length} bullets include metrics. Aim for at least 30% — quantified bullets score significantly higher with ATS and human reviewers.`
      )
    }

    if (weakBulletCount > 0) {
      deductions.push(
        `${weakBulletCount} bullet(s) use weak phrasing ("responsible for", "helped with", "worked on"). Replace with strong action verbs that own the accomplishment.`
      )
    }

    if (strongBullets < contentLines.length * 0.35 && deductions.length < 2) {
      deductions.push(
        `Only ${strongBullets} of ${contentLines.length} bullets score as strong (action verb + metric + result). The formula: "[Verb] + [what] + [how much/result]" maximizes impact scores.`
      )
    }

    if (deductions.length === 0) {
      deductions.push(
        `Excellent bullet quality — ${strongBullets} strong bullets with action verbs, metrics, and results detected.`
      )
    }

    return {
      screenerID: 's4',
      name: 'Impact & Evidence',
      score,
      deductions: deductions.slice(0, 3),
      suggestion:
        score >= 75
          ? 'Strong evidence in your bullets. Add quantified outcomes to remaining bullets where possible.'
          : 'Structure each bullet: [Action Verb] + [what you did] + [metric/result]. Example: "Reduced page load time by 40% by optimizing database queries — improved user retention by 15%."',
    }
  } catch (err) {
    console.warn('[S4] Error:', err)
    return {
      screenerID: 's4',
      name: 'Impact & Evidence',
      score: 0,
      deductions: ['Screener error — check resume formatting.'],
      suggestion: '',
    }
  }
}
