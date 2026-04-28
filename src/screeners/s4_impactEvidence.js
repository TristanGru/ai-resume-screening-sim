import { actionVerbs } from '../data/actionVerbs.js'

const RESULT_WORDS = [
  'increased', 'decreased', 'improved', 'reduced', 'saved', 'grew',
  'generated', 'achieved', 'delivered', 'launched', 'eliminated', 'accelerated',
  'boosted', 'cut', 'doubled', 'raised', 'streamlined', 'transformed',
  'clarified', 'defined', 'identified', 'organized', 'summarized', 'supported',
]

const OUTCOME_PHRASES = [
  'to improve', 'to reduce', 'to support', 'to help', 'to keep', 'to define',
  'to identify', 'to document', 'to summarize', 'for leadership',
  'before weekly', 'across the year', 'spending decisions', 'handoff clarity',
  'planning tasks', 'workflow visibility', 'missing documentation',
]

const WEAK_PHRASES = [
  'responsible for', 'helped with', 'worked on', 'assisted with',
  'participated in', 'involved in', 'helped to', 'tasked with',
  'duties included', 'was part of', 'handled',
]

function getOverloadedBulletGroups(resumeText) {
  const groups = []
  let currentCount = 0

  for (const rawLine of resumeText.split('\n')) {
    const line = rawLine.trim()
    const isBullet = /^[•\-\*▪–]/.test(line)

    if (isBullet) {
      currentCount++
      continue
    }

    if (currentCount > 0) {
      groups.push(currentCount)
      currentCount = 0
    }
  }

  if (currentCount > 0) {
    groups.push(currentCount)
  }

  return groups.filter((count) => count > 4)
}

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

      // Component 2: Evidence/metric — contains a meaningful number (not just a year).
      // Strip 4-digit years (1900–2099) before checking so "2023 project" doesn't count as a metric.
      const strippedOfYears = stripped.replace(/\b(19|20)\d{2}\b/g, '')
      const hasRealQuantifier = (
        /\d/.test(strippedOfYears) ||
        /\b(daily|weekly|monthly|quarterly|annually)\b/i.test(stripped) ||
        /\$[\d,]+/.test(stripped)
      )
      if (hasRealQuantifier) {
        bulletQuality++
        quantifiedCount++
      }

      // Component 3: Result indicator — shows the outcome/impact
      if (RESULT_WORDS.some((w) => lower.includes(w)) || OUTCOME_PHRASES.some((p) => lower.includes(p))) {
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

    // Score: map average bullet quality (0-4) to 10-95.
    // Even strong bullets leave room for sharper causal outcomes and recruiter-ready impact.
    const avgQuality = totalQuality / contentLines.length
    const overloadedBulletGroups = getOverloadedBulletGroups(resumeText)
    const overloadPenalty = Math.min(overloadedBulletGroups.length * 5, 10)
    const score = Math.max(
      0,
      Math.min(100, Math.round(10 + (avgQuality / 4) * 85) - overloadPenalty)
    )

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

    if (overloadedBulletGroups.length > 0) {
      deductions.push(
        `${overloadedBulletGroups.length} role/project section(s) have more than 4 bullets. Strong bullets still count, but long blocks can look unfocused; keep each role to the best 3-4 evidence points.`
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
