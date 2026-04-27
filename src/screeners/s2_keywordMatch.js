import dataAnalystKeywords from '../data/keywords/data-analyst.json'
import softwareEngineerKeywords from '../data/keywords/software-engineer-intern.json'
import businessAnalystKeywords from '../data/keywords/business-analyst.json'

const keywordMap = {
  'data-analyst': dataAnalystKeywords,
  'software-engineer-intern': softwareEngineerKeywords,
  'business-analyst': businessAnalystKeywords,
}

const JD_STOP_WORDS = new Set([
  'the', 'and', 'for', 'with', 'this', 'that', 'will', 'are', 'you', 'our',
  'have', 'from', 'they', 'your', 'able', 'must', 'strong', 'experience',
  'required', 'preferred', 'skills', 'work', 'team', 'role', 'position',
  'candidate', 'responsible', 'including', 'seeking', 'ideal', 'good',
  'excellent', 'ability', 'knowledge', 'proficiency', 'familiarity',
])

const ACTION_VERBS_CONTEXT = [
  'developed', 'created', 'built', 'implemented', 'analyzed', 'used',
  'improved', 'generated', 'automated', 'optimized', 'designed', 'delivered',
  'integrated', 'deployed', 'managed', 'led', 'launched', 'reduced',
]

/**
 * S2 — Keyword Match (Upgraded)
 * Evaluates required coverage, bonus coverage, keyword placement quality,
 * contextual keyword use, and keyword stuffing risk.
 * Intentionally conflicts with S5 — adding keywords boosts this but risks spam penalty.
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

    // ── Merge JD tokens into required list ──────────────────────────────────
    let required = [...keywordData.required]
    if (jdText && jdText.trim().length > 0) {
      const jdTokens = jdText
        .toLowerCase()
        .split(/[\s,;.\n()]+/)
        .filter((t) => t.length > 3 && !JD_STOP_WORDS.has(t))
        .map((t) => t.replace(/[^a-z0-9+#.]/g, ''))
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

    // ── Required keyword coverage ────────────────────────────────────────────
    const matchedRequired = required.filter((kw) => lowerResume.includes(kw.toLowerCase()))
    const requiredRatio = matchedRequired.length / required.length

    let requiredScore = 0
    const deductions = []

    if (requiredRatio >= 0.7) {
      requiredScore = 20 // strong coverage
    } else if (requiredRatio >= 0.4) {
      requiredScore = 10 // moderate
    } else {
      requiredScore = -15 // weak
      const missed = required
        .filter((kw) => !lowerResume.includes(kw.toLowerCase()))
        .slice(0, 4)
      deductions.push(
        `Weak keyword alignment — missing ${required.length - matchedRequired.length} required keyword(s): ${missed.join(', ')}.`
      )
    }

    // ── Bonus/secondary keyword coverage ────────────────────────────────────
    let bonusScore = 0
    if (bonus.length > 0) {
      const matchedBonus = bonus.filter((kw) => lowerResume.includes(kw.toLowerCase()))
      const bonusRatio = matchedBonus.length / bonus.length
      if (bonusRatio >= 0.4) {
        bonusScore = 10
      } else if (bonusRatio < 0.15) {
        bonusScore = -5
        deductions.push('Few bonus/secondary keywords found. Add role-specific tools, frameworks, or methods.')
      }
    }

    // ── Keyword placement quality ────────────────────────────────────────────
    // Keywords in Experience/Projects count more than in Skills only.
    let placementScore = 0
    const expProjMatch = resumeText.match(
      /(?:experience|projects?)[\s\S]*?(?=\n(?:education|skills|summary|$))/i
    )
    const expProjText = expProjMatch ? expProjMatch[0].toLowerCase() : ''
    const skillsMatch = resumeText.match(/skills[\s\S]*?(?=\n[A-Z]|\n\n|$)/i)
    const skillsText = skillsMatch ? skillsMatch[0].toLowerCase() : ''

    const keywordsInExpProj = matchedRequired.filter((kw) =>
      expProjText.includes(kw.toLowerCase())
    )
    const keywordsOnlyInSkills = matchedRequired.filter(
      (kw) =>
        skillsText.includes(kw.toLowerCase()) && !expProjText.includes(kw.toLowerCase())
    )

    if (keywordsInExpProj.length >= matchedRequired.length * 0.4) {
      placementScore = 10
    } else if (keywordsOnlyInSkills.length > keywordsInExpProj.length) {
      placementScore = -10
      deductions.push(
        'Keywords appear mostly in the Skills section. ATS and recruiters weight keywords higher when shown in Experience/Projects with evidence of use.'
      )
    }

    // ── Contextual keyword use ───────────────────────────────────────────────
    // Keywords near action verbs = evidence of real use, not just listing.
    let contextScore = 0
    const lines = resumeText.split('\n')
    const actionBullets = lines.filter((line) => {
      const lower = line.toLowerCase()
      const hasActionVerb = ACTION_VERBS_CONTEXT.some((v) => lower.includes(v))
      const hasKeyword = matchedRequired.some((kw) => lower.includes(kw.toLowerCase()))
      return hasActionVerb && hasKeyword
    })

    if (actionBullets.length >= 3) {
      contextScore = 10
    } else if (actionBullets.length === 0 && matchedRequired.length > 3) {
      contextScore = -10
      deductions.push(
        'Keywords are present but lack context. Show how you used each skill: "Built a dashboard using Tableau" beats listing "Tableau" in a skills row.'
      )
    }

    // ── Keyword stuffing risk ────────────────────────────────────────────────
    // Many keywords + few bullet points = stuffing signal (also triggers S5).
    let stuffingPenalty = 0
    const bulletCount = lines.filter((l) => /^[\s]*[•\-\*▪–]/.test(l)).length
    if (matchedRequired.length > required.length * 0.7 && bulletCount < 4) {
      stuffingPenalty = -15
      deductions.push(
        'Possible keyword stuffing detected — high keyword count with very few bullet points. This pattern triggers spam filters (see Spam Risk score).'
      )
    }

    const rawScore =
      50 + requiredScore + bonusScore + placementScore + contextScore + stuffingPenalty
    const score = Math.max(0, Math.min(100, Math.round(rawScore)))

    if (deductions.length === 0) {
      deductions.push('Strong keyword coverage with good contextual placement in Experience/Projects.')
    }

    const missedTop = required
      .filter((kw) => !lowerResume.includes(kw.toLowerCase()))
      .slice(0, 3)

    return {
      screenerID: 's2',
      name: 'Keyword Match',
      score,
      deductions: deductions.slice(0, 3),
      suggestion:
        missedTop.length > 0
          ? `Add these keywords inside accomplishment bullets in Experience/Projects: ${missedTop.join(', ')}.`
          : 'Keyword coverage is strong. Ensure skills appear in context within Experience bullets, not just in a skills list.',
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
