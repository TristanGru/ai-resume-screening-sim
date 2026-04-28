/**
 * S1 — ATS Parser (Upgraded)
 * Simulates real ATS extraction failure points: contact info, section structure,
 * experience entry consistency, date range quality, education completeness,
 * skills formatting, formatting risk detection, and bullet quality.
 */
export function s1_atsParser(resumeText) {
  try {
    let score = 100
    const deductions = []
    const text = resumeText

    // ── 1. Contact Information Detection ────────────────────────────────────
    // Real ATS systems extract candidate profiles first — missing contact info = unusable record.
    const emailPattern = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/
    const phonePattern = /(\+?1[\s.\-]?)?(\(?\d{3}\)?[\s.\-]?\d{3}[\s.\-]?\d{4})/
    const hasEmail = emailPattern.test(text)
    const hasPhone = phonePattern.test(text)

    if (!hasEmail) {
      score -= 15
      deductions.push('No email address found. ATS systems require contact info to create a candidate record — missing email makes your application unfilterable.')
    }
    if (!hasPhone) {
      score -= 10
      deductions.push('No phone number detected. Missing contact fields can cause your application to be flagged as incomplete by ATS intake systems.')
    }

    // ── 2. Section Structure Validation ─────────────────────────────────────
    // ATS uses headers to segment the resume into structured fields.
    const expectedSections = ['experience', 'education', 'skills', 'projects']
    let sectionsMissing = 0
    for (const section of expectedSections) {
      if (!new RegExp(`\\b${section}\\b`, 'i').test(text)) {
        sectionsMissing++
        deductions.push(
          `Missing "${section.charAt(0).toUpperCase() + section.slice(1)}" section header. ATS cannot segment your resume without standard headings.`
        )
      }
    }
    score -= sectionsMissing * 10
    if (sectionsMissing === 0) score = Math.min(score + 5, 100)

    // ── 3. Date Range Quality ────────────────────────────────────────────────
    // ATS calculates experience duration from date ranges — these are critical.
    const dateRangePattern =
      /\b(?:(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\.?\s+)?(20\d{2}|19\d{2})\s*[-–—]\s*(?:(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\.?\s+)?(20\d{2}|19\d{2}|present|current|now)\b/i
    const hasDateRange = dateRangePattern.test(text)
    if (!hasDateRange) {
      score -= 10
      deductions.push(
        'No date ranges found (e.g., 2022–2024 or 2023–Present). ATS systems calculate total experience duration from these ranges.'
      )
    } else {
      score = Math.min(score + 5, 100)
    }

    // ── 4. Education Completeness ────────────────────────────────────────────
    // ATS extracts structured education fields for candidate filtering.
    // Easy-to-spot parser issue: repeated dated job headers can create duplicate timeline entries.
    const nonEmptyLines = text.split('\n').map((l) => l.trim()).filter(Boolean)
    const datedHeaderLines = nonEmptyLines.filter(
      (line) =>
        !/^[â€¢\-\*â–ªâ€“]/.test(line) &&
        !/^(experience|education|skills|projects|summary)$/i.test(line) &&
        dateRangePattern.test(line)
    )
    const hasRepeatedDatedHeader = datedHeaderLines.some((line, index) => {
      if (index === 0) return false
      const previous = datedHeaderLines[index - 1]
      const role = line.split(/[â€”\-]/)[0]?.trim().toLowerCase()
      const previousRole = previous.split(/[â€”\-]/)[0]?.trim().toLowerCase()
      return role && previousRole && role === previousRole
    })

    const hasSchool = /\b(university|college|institute|school|academy)\b/i.test(text)
    const hasDegree =
      /\b(b\.?s\.?|b\.?a\.?|master'?s?|m\.?s\.?|m\.?b\.?a\.?|ph\.?d\.?|bachelor|associate|diploma)\b/i.test(
        text
      )
    if (!hasSchool || !hasDegree) {
      score -= 10
      deductions.push(
        'Education section appears incomplete. Include school name (university/college), degree type (B.S., M.S., etc.), and expected graduation date.'
      )
    } else {
      score = Math.min(score + 5, 100)
    }

    // ── 5. Formatting Risk Detection ─────────────────────────────────────────
    // Real ATS systems frequently fail on PDFs with tables, columns, and special symbols.
    const highRiskSymbols = /[║│┌┐└┘├┤┬┴┼═╔╗╚╝▀▄█▌▐◆◇★☆●○]/
    // Large whitespace gaps suggest multi-column layout
    const suspiciousWhitespace = /[ \t]{15,}/
    if (highRiskSymbols.test(text) || suspiciousWhitespace.test(text)) {
      score -= 15
      deductions.push(
        'Formatting risk detected — tables, columns, or special graphic symbols found. These commonly cause ATS parsing failures and garbled output.'
      )
    }

    // ── 6. Skills Section Quality ────────────────────────────────────────────
    // ATS normalizes skills — poor formatting reduces accuracy.
    const skillsMatch = text.match(/skills[\s\S]{0,80}?\n([\s\S]*?)(?:\n\n|\n[A-Z]|$)/i)
    if (skillsMatch) {
      const skillsBlock = skillsMatch[1]
      const isCommaOrNewlineSeparated = /,|\n/.test(skillsBlock)
      const isContinuousBlob = skillsBlock.split(/[,\n]/).filter((s) => s.trim()).length < 3
      if (!isCommaOrNewlineSeparated || isContinuousBlob) {
        score -= 10
        deductions.push(
          'Skills section formatting is unclear. Use comma-separated lists or one skill per line so ATS can normalize individual skills.'
        )
      } else {
        score = Math.min(score + 5, 100)
      }
    }

    // ── 7. Bullet Quality ────────────────────────────────────────────────────
    // ATS splits responsibilities into entries using bullets — inconsistency hurts parsing.
    const allLines = text.split('\n').map((l) => l.trim()).filter((l) => l.length > 0)
    const bulletLines = allLines.filter((l) => /^[•\-\*▪–]/.test(l))

    if (bulletLines.length === 0) {
      score -= 5
      deductions.push(
        'No bullet points found. ATS systems use bullet characters to parse individual accomplishments from experience entries.'
      )
    } else {
      score = Math.min(score + 5, 100)
      const shortBullets = bulletLines.filter(
        (l) => l.replace(/^[•\-\*▪–\s]+/, '').trim().length < 15
      )
      if (shortBullets.length > bulletLines.length * 0.5) {
        score -= 5
        deductions.push(
          `${shortBullets.length} bullet(s) are very short (under 15 chars). ATS expects complete responsibility or accomplishment statements.`
        )
      }
    }

    if (hasRepeatedDatedHeader) {
      score -= 5
      deductions.push(
        'Duplicate dated role line detected. ATS timeline parsers may treat repeated job headers as separate jobs; remove accidental duplicate entries.'
      )
    }

    score = Math.max(0, Math.min(100, score))

    if (deductions.length === 0) {
      deductions.push('All ATS formatting checks passed — clean, parseable structure detected.')
    }

    const suggestion =
      score >= 80
        ? 'Strong ATS formatting. Double-check that all section headers use standard labels and every job has a date range.'
        : score >= 50
        ? 'Add missing contact info (email + phone), ensure standard section headers are present, and include date ranges for each role.'
        : 'Major parsing issues detected. Add email, phone, standard sections (Experience, Education, Skills, Projects), date ranges, and bullet points.'

    return {
      screenerID: 's1',
      name: 'ATS Parser',
      score,
      deductions: deductions.slice(0, 3),
      suggestion,
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
