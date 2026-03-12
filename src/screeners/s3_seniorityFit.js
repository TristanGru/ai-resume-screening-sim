/**
 * S3 — Seniority Fit
 * Scores how well the resume matches the expected seniority level for the role.
 */
export function s3_seniorityFit(resumeText, role) {
  try {
    let score = 70
    const lowerText = resumeText.toLowerCase()
    const deductions = []

    if (role === 'software-engineer-intern') {
      const studentSignals = ['intern', 'student', 'university', 'coursework']
      const hasStudentSignal = studentSignals.some((s) => lowerText.includes(s))

      if (hasStudentSignal) {
        score += 15
      } else {
        deductions.push('No student/intern signals found (intern, student, university, coursework).')
      }

      const seniorSignals = ['vp', 'director', 'managed a team of']
      const hasSeniorSignal = seniorSignals.some((s) => lowerText.includes(s))
      if (hasSeniorSignal && !hasStudentSignal) {
        score -= 20
        deductions.push('Senior-level signals (VP, Director, managed a team) found without student context — overqualified framing.')
      }
    } else if (role === 'data-analyst' || role === 'business-analyst') {
      const analyticalSignals1 = ['stakeholder', 'requirement', 'recommendation']
      const hasAnalytical1 = analyticalSignals1.some((s) => lowerText.includes(s))
      if (hasAnalytical1) {
        score += 15
      } else {
        deductions.push('Missing analytical signals: stakeholder management, requirements, or recommendations.')
      }

      const analyticalSignals2 = ['insight', 'decision']
      const hasAnalytical2 = analyticalSignals2.some((s) => lowerText.includes(s))
      if (hasAnalytical2) {
        score += 15
      } else {
        deductions.push('Missing impact signals: insights or data-driven decisions.')
      }

      if (role === 'business-analyst') {
        // TODO: DEFINE RULES — see Open Question OQ-001
        // Placeholder: basic BA-specific check
        const baSignals = ['process', 'workflow', 'kpi', 'roi', 'user stories']
        const hasBASignal = baSignals.some((s) => lowerText.includes(s))
        if (!hasBASignal) {
          score -= 10
          deductions.push('Missing business analyst signals: process, workflow, KPI, ROI, or user stories.')
        }
      }
    }

    score = Math.max(0, Math.min(100, score))

    if (deductions.length === 0) {
      deductions.push('Seniority level signals align well with this role.')
    }

    return {
      screenerID: 's3',
      name: 'Seniority Fit',
      score,
      deductions: deductions.slice(0, 3),
      suggestion:
        role === 'software-engineer-intern'
          ? 'Emphasize your student/intern background. Mention university projects and coursework.'
          : 'Include stakeholder interactions, data-driven decisions, and business impact language.',
    }
  } catch (err) {
    console.warn('[S3] Error:', err)
    return {
      screenerID: 's3',
      name: 'Seniority Fit',
      score: 0,
      deductions: ['Screener error — check resume formatting.'],
      suggestion: '',
    }
  }
}
