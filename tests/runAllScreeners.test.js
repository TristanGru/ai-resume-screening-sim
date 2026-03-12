import { describe, it, expect } from 'vitest'
import { runAllScreeners, computeRobustScore } from '../src/screeners/index.js'

const SAMPLE_RESUME = `Jane Smith
Experience
- Developed REST API using Python and Flask, reducing latency by 40%
- Built SQL queries to analyze 500,000-row datasets
Education
B.S. Computer Science, University of Virginia, May 2024
Skills
Python, SQL, React, Git, data structures
Projects
• Resume Parser Tool — JavaScript and React`

describe('runAllScreeners', () => {
  it('returns exactly 5 results', () => {
    const { results } = runAllScreeners(SAMPLE_RESUME, 'data-analyst')
    expect(results).toHaveLength(5)
  })

  it('all results have required fields', () => {
    const { results } = runAllScreeners(SAMPLE_RESUME, 'software-engineer-intern')
    for (const r of results) {
      expect(r.screenerID).toBeTruthy()
      expect(r.name).toBeTruthy()
      expect(typeof r.score).toBe('number')
      expect(r.score).toBeGreaterThanOrEqual(0)
      expect(r.score).toBeLessThanOrEqual(100)
      expect(Array.isArray(r.deductions)).toBe(true)
      expect(r.deductions.length).toBeGreaterThanOrEqual(1)
      expect(typeof r.suggestion).toBe('string')
    }
  })

  it('screener IDs are in order s1–s5', () => {
    const { results } = runAllScreeners(SAMPLE_RESUME, 'business-analyst')
    expect(results[0].screenerID).toBe('s1')
    expect(results[1].screenerID).toBe('s2')
    expect(results[2].screenerID).toBe('s3')
    expect(results[3].screenerID).toBe('s4')
    expect(results[4].screenerID).toBe('s5')
  })

  it('returns a robustScore', () => {
    const { robustScore } = runAllScreeners(SAMPLE_RESUME, 'data-analyst')
    expect(typeof robustScore).toBe('number')
    expect(robustScore).toBeGreaterThanOrEqual(0)
  })
})

describe('computeRobustScore', () => {
  it('correct with no spam penalty (s5 = 100)', () => {
    const results = [
      { screenerID: 's1', score: 80 },
      { screenerID: 's2', score: 90 },
      { screenerID: 's3', score: 70 },
      { screenerID: 's4', score: 60 },
      { screenerID: 's5', score: 100 },
    ]
    const score = computeRobustScore(results)
    // mean = (80+90+70+60+100)/5 = 80, penalty = max(0, (100-100)*0.2) = 0
    expect(score).toBe(80.0)
  })

  it('correct with maximum spam penalty (s5 = 0)', () => {
    const results = [
      { screenerID: 's1', score: 80 },
      { screenerID: 's2', score: 80 },
      { screenerID: 's3', score: 80 },
      { screenerID: 's4', score: 80 },
      { screenerID: 's5', score: 0 },
    ]
    const score = computeRobustScore(results)
    // mean = (80+80+80+80+0)/5 = 64, penalty = max(0, (100-0)*0.2) = 20
    expect(score).toBe(44.0)
  })

  it('all scores 100 returns 100', () => {
    const results = [
      { screenerID: 's1', score: 100 },
      { screenerID: 's2', score: 100 },
      { screenerID: 's3', score: 100 },
      { screenerID: 's4', score: 100 },
      { screenerID: 's5', score: 100 },
    ]
    const score = computeRobustScore(results)
    expect(score).toBe(100.0)
  })
})
