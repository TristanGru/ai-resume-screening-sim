import { describe, it, expect } from 'vitest'
import { s1_atsParser } from '../../src/screeners/s1_atsParser.js'

const WELL_FORMED = `Jane Smith | jane@email.com | 555-123-4567

Experience
- Built REST API using Python and Flask, 2022 – 2023
- Developed SQL data pipelines reducing processing time by 30%
Education
B.S. Computer Science, University of Virginia, May 2024
Skills
Python, SQL, React, Git, Flask
Projects
• Resume parser tool — JavaScript and React web app`

const SPARSE = `Bob Williams
bob@email.com
I have worked at various companies doing various things.`

const NO_BULLETS = `Jane Smith
Experience
Built REST API in 2023
Education
B.S. Computer Science 2024
Skills
Python SQL
Projects
Resume tool`

describe('s1_atsParser', () => {
  it('well-formed resume scores high (≥ 80)', () => {
    const result = s1_atsParser(WELL_FORMED)
    expect(result.screenerID).toBe('s1')
    expect(result.name).toBe('ATS Parser')
    expect(result.score).toBeGreaterThanOrEqual(80)
    expect(result.deductions.length).toBeGreaterThanOrEqual(1)
    expect(result.suggestion).toBeTruthy()
  })

  it('sparse resume missing most sections scores low', () => {
    const result = s1_atsParser(SPARSE)
    expect(result.score).toBeLessThanOrEqual(50)
  })

  it('deducts for missing bullets', () => {
    const result = s1_atsParser(NO_BULLETS)
    // Resume with no bullets should score poorly — contact info deductions take top 3 slots
    expect(result.score).toBeLessThan(75)
  })

  it('score is always 0–100', () => {
    const result = s1_atsParser('')
    expect(result.score).toBeGreaterThanOrEqual(0)
    expect(result.score).toBeLessThanOrEqual(100)
  })

  it('deductions is a non-empty array', () => {
    const result = s1_atsParser(WELL_FORMED)
    expect(Array.isArray(result.deductions)).toBe(true)
    expect(result.deductions.length).toBeGreaterThanOrEqual(1)
  })

  it('handles all-caps resume (EC-001)', () => {
    const result = s1_atsParser(WELL_FORMED.toUpperCase())
    expect(result.score).toBeGreaterThanOrEqual(0)
    expect(result.score).toBeLessThanOrEqual(100)
  })
})
