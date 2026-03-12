import { buzzwords } from '../data/buzzwords.js'

/**
 * S5 — Spam / Risk
 * Detects keyword stuffing, oversized skills lists, and excessive buzzword usage.
 * NOTE: This intentionally conflicts with S2 — adding more keywords boosts S2 but hurts S5.
 */
export function s5_spamRisk(resumeText) {
  try {
    let score = 100
    const deductions = []

    // -20 if skills section has > 20 comma/newline-separated items
    const skillsMatch = resumeText.match(/skills[\s\S]{0,50}?\n([\s\S]*?)(?:\n\n|\n[A-Z]|$)/i)
    if (skillsMatch) {
      const skillsBlock = skillsMatch[1]
      const items = skillsBlock
        .split(/[,\n]/)
        .map((s) => s.trim())
        .filter((s) => s.length > 0)
      if (items.length > 20) {
        score -= 20
        deductions.push(
          `Skills section contains ${items.length} items (> 20). Excessive skill lists trigger spam filters.`
        )
      }
    }

    // -5 for each keyword appearing > 5 times, capped at -30
    const words = resumeText.toLowerCase().split(/\W+/).filter((w) => w.length > 2)
    const wordCounts = {}
    for (const word of words) {
      wordCounts[word] = (wordCounts[word] || 0) + 1
    }

    let repetitionPenalty = 0
    const repeatedKeywords = []
    for (const [word, count] of Object.entries(wordCounts)) {
      if (count > 5 && word.length > 3) {
        repetitionPenalty = Math.min(repetitionPenalty + 5, 30)
        repeatedKeywords.push(`"${word}" (${count}x)`)
      }
    }
    score -= repetitionPenalty
    if (repeatedKeywords.length > 0) {
      deductions.push(
        `Repeated keywords detected: ${repeatedKeywords.slice(0, 3).join(', ')}. This looks like keyword stuffing.`
      )
    }

    // -15 if buzzword density > 5%
    const totalWords = words.length
    if (totalWords > 0) {
      let buzzCount = 0
      const lowerText = resumeText.toLowerCase()
      for (const bw of buzzwords) {
        if (lowerText.includes(bw.toLowerCase())) {
          buzzCount++
        }
      }
      const buzzDensity = buzzCount / totalWords
      if (buzzDensity > 0.05) {
        score -= 15
        deductions.push(
          `High buzzword density detected (${(buzzDensity * 100).toFixed(1)}%). Replace vague terms with specific accomplishments.`
        )
      }
    }

    score = Math.max(0, score)

    if (deductions.length === 0) {
      deductions.push('No spam or keyword-stuffing signals detected.')
    }

    return {
      screenerID: 's5',
      name: 'Spam / Risk',
      score,
      deductions: deductions.slice(0, 3),
      suggestion:
        score < 60
          ? 'Remove keyword lists from your skills section. Use keywords naturally in context within your experience bullets.'
          : 'Maintain natural keyword usage. Avoid listing the same term multiple times.',
    }
  } catch (err) {
    console.warn('[S5] Error:', err)
    return {
      screenerID: 's5',
      name: 'Spam / Risk',
      score: 0,
      deductions: ['Screener error — check resume formatting.'],
      suggestion: '',
    }
  }
}
