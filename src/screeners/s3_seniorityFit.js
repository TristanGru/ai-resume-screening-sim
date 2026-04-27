/**
 * S3 — Seniority Fit (Upgraded)
 * Evaluates whether the resume's seniority signals match the target role.
 * Starts at 50 for symmetric scoring — positive signals add, negative signals subtract.
 */
export function s3_seniorityFit(resumeText, role) {
  try {
    let score = 50
    const lowerText = resumeText.toLowerCase()
    const deductions = []

    if (role === 'software-engineer-intern') {
      // ── Student/Intern signal detection ─────────────────────────────────
      // ATS for intern roles looks for signals the candidate is currently a student.
      const studentSignals = ['intern', 'student', 'university', 'coursework', 'undergraduate', 'junior']
      const hasStudentSignal = studentSignals.some((s) => lowerText.includes(s))

      if (hasStudentSignal) {
        score += 15
      } else {
        deductions.push(
          'No student/intern signals found (intern, student, university, coursework). Intern ATS filters look for these to confirm current enrollment.'
        )
      }

      // ── Overqualification detection ──────────────────────────────────────
      // ATS may flag candidates who appear too senior for an intern role.
      const seniorSignals = ['vp', 'vice president', 'director', 'managed a team of', 'c-suite', 'chief']
      const hasSeniorSignal = seniorSignals.some((s) => lowerText.includes(s))
      if (hasSeniorSignal && !hasStudentSignal) {
        score -= 20
        deductions.push(
          'Senior-level signals (VP, Director, managed a team) detected without student context. This flags overqualified framing for an intern role.'
        )
      }

      // ── Technical project signals ────────────────────────────────────────
      const projectSignals = ['github', 'portfolio', 'project', 'built', 'developed', 'class project', 'hackathon']
      const hasProjectSignal = projectSignals.some((s) => lowerText.includes(s))
      if (hasProjectSignal) {
        score += 10
      } else {
        deductions.push(
          'No project or portfolio signals found. Intern ATS systems reward candidates who show personal or academic projects alongside coursework.'
        )
      }

    } else if (role === 'data-analyst' || role === 'business-analyst') {
      // ── Analyst signal detection ─────────────────────────────────────────
      // ATS for analyst roles looks for core analytical responsibility language.
      const analyticalSignals = ['stakeholder', 'requirement', 'recommendation']
      const hasAnalytical = analyticalSignals.some((s) => lowerText.includes(s))
      if (hasAnalytical) {
        score += 15
      } else {
        deductions.push(
          'Missing analytical signals: stakeholder management, requirements gathering, or recommendations. These are core analyst role indicators.'
        )
      }

      // ── Impact signal detection ──────────────────────────────────────────
      // ATS rewards resumes showing the candidate's work influenced decisions.
      const impactSignals = ['insight', 'decision', 'data-driven', 'informed', 'outcome']
      const hasImpact = impactSignals.some((s) => lowerText.includes(s))
      if (hasImpact) {
        score += 15
      } else {
        deductions.push(
          'Missing impact signals: insights, data-driven decisions, or measurable outcomes. Analyst ATS expects evidence of work that influenced strategy.'
        )
      }

      if (role === 'business-analyst') {
        // ── Business Analyst-specific signals ─────────────────────────────
        const baSignals = ['process', 'workflow', 'kpi', 'roi', 'user stories', 'sprint', 'backlog', 'uat', 'gap analysis']
        const hasBASignal = baSignals.some((s) => lowerText.includes(s))
        if (hasBASignal) {
          score += 10
        } else {
          score -= 10
          deductions.push(
            'Missing business analyst signals: process improvement, workflow, KPI, ROI, user stories, or sprint. BA ATS filters specifically target these terms.'
          )
        }

        // ── BA overqualification detection ──────────────────────────────
        const baOverqualified = ['cto', 'coo', 'chief', 'vp of', 'vice president of']
        const hasBaOverqualified = baOverqualified.some((s) => lowerText.includes(s))
        if (hasBaOverqualified) {
          score -= 10
          deductions.push(
            'Executive-level signals detected for a Business Analyst role. This may trigger overqualification filters.'
          )
        }
      }

      if (role === 'data-analyst') {
        // ── Data Analyst-specific signals ─────────────────────────────────
        const daSignals = ['dashboard', 'visualization', 'report', 'query', 'dataset', 'metric', 'analysis', 'trend']
        const hasDASignal = daSignals.some((s) => lowerText.includes(s))
        if (hasDASignal) {
          score += 10
        } else {
          deductions.push(
            'Missing data analyst signals: dashboards, visualizations, reporting, or queries. DA ATS expects evidence of core analytical work products.'
          )
        }
      }
    }

    score = Math.max(0, Math.min(100, score))

    if (deductions.length === 0) {
      deductions.push('Seniority level and role signals align well with the target position.')
    }

    const suggestion =
      role === 'software-engineer-intern'
        ? 'Highlight your student/intern status, mention coursework and university projects, and link to GitHub or a portfolio.'
        : role === 'data-analyst'
        ? 'Include stakeholder reporting, dashboards you built, insights that informed decisions, and data tools used in context.'
        : 'Include user stories, process improvement outcomes, KPIs tracked, sprint involvement, and stakeholder interaction language.'

    return {
      screenerID: 's3',
      name: 'Seniority Fit',
      score,
      deductions: deductions.slice(0, 3),
      suggestion,
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
