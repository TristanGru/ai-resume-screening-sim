/**
 * S1 — ATS Parser
 * Checks for standard resume sections, date patterns, and bullet characters.
 */
export function s1_atsParser(resumeText) {
  try {
    let score = 100
    const deductions = []
    const text = resumeText

    // Check for standard sections (case-insensitive)
    const sections = ['experience', 'education', 'skills', 'projects']
    for (const section of sections) {
      if (!new RegExp(section, 'i').test(text)) {
        score -= 15
        deductions.push(`Missing "${section.charAt(0).toUpperCase() + section.slice(1)}" section heading.`)
      }
    }

    // Check for date patterns
    const datePattern = /\b(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec|20\d\d|19\d\d)\b/
    if (!datePattern.test(text)) {
      score -= 10
      deductions.push('No date patterns detected. Employers and ATS expect dates for each position.')
    }

    // Check for bullet characters
    const bulletPattern = /[•\-\*▪–]/
    if (!bulletPattern.test(text)) {
      score -= 10
      deductions.push('No bullet point characters found. ATS systems use bullets to parse individual accomplishments.')
    }

    score = Math.max(0, score)

    // Ensure at least one deduction if score is not 100
    if (deductions.length === 0) {
      deductions.push('All standard ATS formatting checks passed.')
    }

    return {
      screenerID: 's1',
      name: 'ATS Parser',
      score,
      deductions: deductions.slice(0, 3),
      suggestion:
        score === 100
          ? 'Keep your clean formatting. Ensure section headings use standard labels.'
          : 'Add all four standard sections (Experience, Education, Skills, Projects), include dates, and use bullet points.',
    }
  } catch (err) {
    console.warn('[S1] Error:', err)
    return {
      screenerID: 's1',
      name: 'ATS Parser',
      score: 0,
      deductions: ['Screener error — check resume formatting.'],
      suggestion: '',
    }
  }
}
