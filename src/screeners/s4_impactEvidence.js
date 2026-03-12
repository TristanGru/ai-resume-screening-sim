import { actionVerbs } from '../data/actionVerbs.js'

/**
 * S4 — Impact & Evidence
 * Rewards quantified achievements and strong action verbs; penalizes weak phrasing.
 */
export function s4_impactEvidence(resumeText) {
  try {
    let score = 50
    const deductions = []

    // Split into lines/bullets
    const lines = resumeText.split('\n').map((l) => l.trim()).filter((l) => l.length > 0)

    // +2 per bullet with a number or percentage, capped at +30
    const numberPattern = /\d+%?/
    let quantifiedBonus = 0
    let quantifiedCount = 0
    for (const line of lines) {
      if (numberPattern.test(line)) {
        quantifiedBonus = Math.min(quantifiedBonus + 2, 30)
        quantifiedCount++
      }
    }
    score += quantifiedBonus
    if (quantifiedCount === 0) {
      deductions.push('No quantified achievements found. Add numbers, percentages, or metrics to bullets.')
    }

    // +10 if ≥5 action verbs found
    const lowerText = resumeText.toLowerCase()
    const foundVerbs = actionVerbs.filter((v) => lowerText.includes(v.toLowerCase()))
    if (foundVerbs.length >= 5) {
      score += 10
    } else {
      deductions.push(
        `Only ${foundVerbs.length} strong action verb(s) found. Use at least 5 (e.g., built, delivered, optimized).`
      )
    }

    // -5 per weak phrase bullet, capped at -30
    const weakPhrases = ['responsible for', 'helped with', 'worked on', 'assisted with']
    let weakPenalty = 0
    let weakCount = 0
    for (const line of lines) {
      // Strip leading bullet characters before checking for weak phrase starts
      const stripped = line.replace(/^[\-\*•▪–]\s*/, '').trim()
      const lower = stripped.toLowerCase()
      if (weakPhrases.some((p) => lower.startsWith(p))) {
        weakPenalty = Math.min(weakPenalty + 5, 30)
        weakCount++
      }
    }
    score -= weakPenalty
    if (weakCount > 0) {
      deductions.push(
        `${weakCount} bullet(s) start with weak phrases ("responsible for", "helped with", etc.). Use strong action verbs instead.`
      )
    }

    score = Math.max(0, Math.min(100, score))

    if (deductions.length === 0) {
      deductions.push('Strong use of quantified achievements and action verbs.')
    }

    return {
      screenerID: 's4',
      name: 'Impact & Evidence',
      score,
      deductions: deductions.slice(0, 3),
      suggestion:
        'Start bullets with strong action verbs and include at least one number or metric per role.',
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
