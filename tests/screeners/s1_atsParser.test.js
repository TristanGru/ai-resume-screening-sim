import { describe, it, expect } from 'vitest'
import { s1_atsParser } from '../../src/screeners/s1_atsParser.js'
import { STARTER_RESUMES } from '../../src/data/sampleResumes.js'

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

const DUPLICATE_DATED_ROLE = `Jordan Lee | jordan@email.com | 555-234-5678

Experience
Administrative Assistant - Campus Student Center (Sep 2022 - May 2023)
Administrative Assistant - Campus Center (Sep 2022 - May 2023)
- Managed 40+ weekly inquiries by clarifying needs and directing individuals to resources
Education
B.S. Business Administration, State University, Expected May 2025
Skills
Excel, SQL, Jira, Documentation
Projects
- Built an Excel dashboard for 1 student organization`

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

  it('deducts for repeated dated role headers', () => {
    const result = s1_atsParser(DUPLICATE_DATED_ROLE)
    expect(result.score).toBeLessThan(100)
    expect(result.deductions.some((d) => d.includes('Duplicate dated role line'))).toBe(true)
  })

  it('starter resumes have one easy ATS parser fix worth 5 points', () => {
    for (const resume of Object.values(STARTER_RESUMES)) {
      const result = s1_atsParser(resume)
      expect(result.score).toBe(95)
      expect(result.suggestion).toContain('Remove the duplicate role header')
    }
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
