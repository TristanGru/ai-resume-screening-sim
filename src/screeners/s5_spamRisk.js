import { buzzwords } from '../data/buzzwords.js'

const EXAGGERATED_CLAIMS = [
  'expert in everything', 'best in class', 'world-class', 'genius',
  '10x engineer', '10x developer', 'master of all', 'rockstar', 'ninja',
  'guru', 'wizard', 'god-tier', 'legendary', 'unparalleled', 'unmatched',
  'best ever', 'top performer in the world',
]

const UNPROFESSIONAL_CONTENT = [
  'lol', 'omg', 'wtf', 'damn', 'haha', 'lmao', 'crazy good', 'sick skills',
  'super passionate', 'literally obsessed', 'honestly', 'basically',
]

const SUSPICIOUS_LINK_PATTERNS = [
  /bit\.ly\//i, /tinyurl\.com\//i, /t\.co\//i, /goo\.gl\//i,
  /ow\.ly\//i, /is\.gd\//i, /buff\.ly\//i,
]

/**
 * S5 — Spam / Risk (Upgraded)
 * Detects keyword stuffing, oversized skill lists, buzzword abuse, exaggerated claims,
 * suspicious links, unprofessional content, and evidence-to-keyword imbalance.
 * NOTE: Intentionally conflicts with S2 — more keywords boosts S2 but hurts S5.
 */
export function s5_spamRisk(resumeText) {
  try {
    let score = 100
    const deductions = []
    const lowerText = resumeText.toLowerCase()

    // ── 1. Keyword Stuffing Detection ───────────────────────────────────────
    const words = resumeText.toLowerCase().split(/\W+/).filter((w) => w.length > 2)
    const wordCounts = {}
    for (const word of words) {
      wordCounts[word] = (wordCounts[word] || 0) + 1
    }

    // Skip common resume/English words
    const skipWords = new Set([
      'the', 'and', 'for', 'with', 'this', 'that', 'have', 'from',
      'experience', 'education', 'skills', 'work', 'team', 'role',
      'position', 'company', 'project', 'using', 'worked', 'year',
    ])

    let repetitionPenalty = 0
    const repeatedKeywords = []
    for (const [word, count] of Object.entries(wordCounts)) {
      if (count > 5 && word.length > 2 && !skipWords.has(word)) {
        const penalty = count > 10 ? 10 : 5 // heavier penalty for extreme repetition
        repetitionPenalty = Math.min(repetitionPenalty + penalty, 30)
        repeatedKeywords.push(`"${word}" (${count}×)`)
      }
    }

    if (repetitionPenalty > 0) {
      const level = repetitionPenalty >= 20 ? 'High' : 'Mild'
      score -= repetitionPenalty
      deductions.push(
        `${level} keyword stuffing detected: ${repeatedKeywords.slice(0, 3).join(', ')}. Repeating terms beyond 5× triggers ATS and recruiter spam filters.`
      )
    } else {
      score = Math.min(score + 5, 100)
    }

    // ── 2. Oversized Skills List Detection ──────────────────────────────────
    const skillsMatch = resumeText.match(/skills[\s\S]{0,80}?\n([\s\S]*?)(?:\n\n|\n[A-Z]|$)/i)
    if (skillsMatch) {
      const skillsBlock = skillsMatch[1]
      const items = skillsBlock
        .split(/[,\n]/)
        .map((s) => s.trim())
        .filter((s) => s.length > 0)

      if (items.length > 25) {
        score -= 20
        deductions.push(
          `Skills section has ${items.length} items (> 25). Excessive skill dumps look like ATS manipulation and reduce recruiter trust.`
        )
      } else if (items.length > 20) {
        score -= 10
        deductions.push(
          `Skills section has ${items.length} items (> 20). Slightly excessive — trim to the most relevant 15–20 skills for this role.`
        )
      } else if (items.length > 0) {
        score = Math.min(score + 5, 100)
      }
    }

    // ── 3. Buzzword Density Detection ───────────────────────────────────────
    const totalWords = words.length
    if (totalWords > 0) {
      let buzzCount = 0
      for (const bw of buzzwords) {
        if (lowerText.includes(bw.toLowerCase())) buzzCount++
      }
      const buzzDensity = buzzCount / totalWords

      if (buzzDensity > 0.05) {
        score -= 15
        deductions.push(
          `High buzzword density (${(buzzDensity * 100).toFixed(1)}%). Vague terms like "innovative," "passionate," and "synergy" reduce credibility — replace with specific accomplishments.`
        )
      } else if (buzzDensity > 0.02) {
        score -= 5
      } else {
        score = Math.min(score + 5, 100)
      }
    }

    // ── 4. Exaggerated Claims Detection ─────────────────────────────────────
    const hasExaggeration = EXAGGERATED_CLAIMS.some((claim) => lowerText.includes(claim))
    if (hasExaggeration) {
      score -= 10
      deductions.push(
        'Exaggerated claims detected ("rockstar", "10x engineer", "world-class", etc.). Recruiters distrust absolute or impossible-sounding language — use specific, verifiable accomplishments instead.'
      )
    } else {
      score = Math.min(score + 5, 100)
    }

    // ── 5. Suspicious Link / Contact Risk ───────────────────────────────────
    const hasSuspiciousLink = SUSPICIOUS_LINK_PATTERNS.some((p) => p.test(resumeText))
    const urlCount = (resumeText.match(/https?:\/\/[^\s]+/g) || []).length
    if (hasSuspiciousLink) {
      score -= 10
      deductions.push(
        'Shortened or suspicious URLs detected. Use full professional links (LinkedIn, GitHub, portfolio) — shortened URLs can trigger spam filters.'
      )
    } else if (urlCount > 5) {
      score -= 5
      deductions.push('Too many links detected. Keep to 2–3 professional links (LinkedIn, GitHub, portfolio).')
    }

    // ── 6. Unprofessional Content Detection ─────────────────────────────────
    const hasUnprofessional = UNPROFESSIONAL_CONTENT.some((term) => lowerText.includes(term))
    if (hasUnprofessional) {
      score -= 10
      deductions.push(
        'Informal or unprofessional language detected. Maintain a formal, professional tone throughout — avoid slang, casual phrasing, and filler words.'
      )
    }

    // ── 7. Evidence-to-Keyword Balance ──────────────────────────────────────
    // High keyword density without accomplishment bullets = spam signal.
    const bulletCount = resumeText.split('\n').filter((l) => /^[\s]*[•\-\*▪–]/.test(l)).length
    const uniqueKeywordCount = Object.keys(wordCounts).filter(
      (w) => w.length > 4 && wordCounts[w] >= 2
    ).length

    if (uniqueKeywordCount > 5 && bulletCount < 4) {
      score -= 15
      deductions.push(
        'High keyword-to-evidence imbalance — many repeated technical terms but very few accomplishment bullets. ATS systems and recruiters flag this pattern as skill padding.'
      )
    } else if (bulletCount >= 6 && uniqueKeywordCount > 5) {
      score = Math.min(score + 10, 100)
    }

    score = Math.max(0, Math.min(100, score))

    if (deductions.length === 0) {
      deductions.push('No spam or risk signals detected — clean keyword usage with good evidence balance.')
    }

    return {
      screenerID: 's5',
      name: 'Spam / Risk',
      score,
      deductions: deductions.slice(0, 3),
      suggestion:
        score < 60
          ? 'Remove keyword lists from Skills, use keywords naturally inside Experience bullets, cut exaggerated claims, and trim the skills section to 15–20 items.'
          : 'Maintain natural keyword usage. Ensure every repeated skill is backed by an accomplishment bullet somewhere in your Experience section.',
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
