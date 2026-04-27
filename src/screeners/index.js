import { s1_atsParser } from './s1_atsParser.js'
import { s2_keywordMatch } from './s2_keywordMatch.js'
import { s3_seniorityFit } from './s3_seniorityFit.js'
import { s4_impactEvidence } from './s4_impactEvidence.js'
import { s5_spamRisk } from './s5_spamRisk.js'
import { BUNDLED_JDS } from '../data/bundledJDs.js'

export function computeRobustScore(results) {
  const mean = results.reduce((sum, r) => sum + r.score, 0) / results.length
  const s5Score = results.find((r) => r.screenerID === 's5')?.score ?? 100
  const spamPenalty = Math.max(0, (100 - s5Score) * 0.2)
  return Math.round((mean - spamPenalty) * 10) / 10
}

export function runAllScreeners(resumeText, role) {
  console.info('[runAllScreeners]', { role, resumeText: resumeText.slice(0, 60) })

  const jdText = BUNDLED_JDS[role] || ''

  const results = [
    s1_atsParser(resumeText),
    s2_keywordMatch(resumeText, role, jdText),
    s3_seniorityFit(resumeText, role),
    s4_impactEvidence(resumeText),
    s5_spamRisk(resumeText),
  ]

  const robustScore = computeRobustScore(results)
  return { results, robustScore }
}
