import dataAnalystKeywords from '../data/keywords/data-analyst.json'
import softwareEngineerKeywords from '../data/keywords/software-engineer-intern.json'
import businessAnalystKeywords from '../data/keywords/business-analyst.json'

const keywordMap = {
  'data-analyst': dataAnalystKeywords,
  'software-engineer-intern': softwareEngineerKeywords,
  'business-analyst': businessAnalystKeywords,
}

/**
 * S2 — Keyword Match
 * Scores based on presence of required and bonus keywords for the selected role.
 * If JD text is provided, unique tokens from the JD are merged into required list.
 */
export function s2_keywordMatch(resumeText, role, jdText = '') {
  try {
    const keywordData = keywordMap[role]
    if (!keywordData) {
      return {
        screenerID: 's2',
        name: 'Keyword Match',
        score: 0,
        deductions: ['Unknown role — no keyword list available.'],
        suggestion: 'Select a valid role from the dropdown.',
      }
    }

    const lowerResume = resumeText.toLowerCase()

    // Merge JD tokens into required list if JD provided
    let required = [...keywordData.required]
    if (jdText && jdText.trim().length > 0) {
      const jdTokens = jdText
        .toLowerCase()
        .split(/[\s,;.\n]+/)
        .filter((t) => t.length > 3)
        .map((t) => t.replace(/[^a-z0-9+#]/g, ''))
        .filter((t) => t.length > 2)
      const existingLower = required.map((k) => k.toLowerCase())
      for (const token of jdTokens) {
        if (!existingLower.includes(token)) {
          required.push(token)
          existingLower.push(token)
        }
      }
    }

    const bonus = keywordData.bonus || []

    // Match required keywords
    const matchedRequired = required.filter((kw) =>
      lowerResume.includes(kw.toLowerCase())
    )
    const totalRequired = required.length

    // Match bonus keywords
    let bonusScore = 30
    if (bonus.length > 0) {
      const matchedBonus = bonus.filter((kw) =>
        lowerResume.includes(kw.toLowerCase())
      )
      bonusScore = Math.round((matchedBonus.length / bonus.length) * 30)
    }

    const requiredScore = Math.round((matchedRequired.length / totalRequired) * 70)
    const score = Math.min(100, requiredScore + bonusScore)

    const missedRequired = required
      .filter((kw) => !lowerResume.includes(kw.toLowerCase()))
      .slice(0, 5)

    const deductions = []
    if (matchedRequired.length < totalRequired) {
      deductions.push(
        `Missing ${totalRequired - matchedRequired.length} required keyword(s): ${missedRequired.join(', ')}.`
      )
    }
    if (bonusScore < 15) {
      deductions.push('Few bonus/secondary keywords found. Consider adding more role-specific technical terms.')
    }
    if (deductions.length === 0) {
      deductions.push('Strong keyword coverage for this role.')
    }

    return {
      screenerID: 's2',
      name: 'Keyword Match',
      score,
      deductions: deductions.slice(0, 3),
      suggestion:
        missedRequired.length > 0
          ? `Add these missing keywords naturally in context: ${missedRequired.slice(0, 3).join(', ')}.`
          : 'Keyword coverage is strong. Focus on context and specificity.',
    }
  } catch (err) {
    console.warn('[S2] Error:', err)
    return {
      screenerID: 's2',
      name: 'Keyword Match',
      score: 0,
      deductions: ['Screener error — check resume formatting.'],
      suggestion: '',
    }
  }
}
