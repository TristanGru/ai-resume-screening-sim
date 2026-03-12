import { describe, it, expect } from 'vitest'
import { s3_seniorityFit } from '../../src/screeners/s3_seniorityFit.js'

const STUDENT_RESUME = `Jane Smith
Software Engineering Intern at TechCorp
B.S. Computer Science, University of Virginia
Relevant coursework: Algorithms, Data Structures`

const SENIOR_RESUME = `John Doe
VP of Engineering at BigCorp
Director of Software Development
Managed a team of 20 engineers`

const ANALYST_RESUME = `Jane Smith
Data Analyst
- Provided insights and recommendations to stakeholders
- Drove data-driven decisions for senior leadership
- Improved requirement gathering process`

describe('s3_seniorityFit', () => {
  it('student resume scores high for software-engineer-intern', () => {
    const result = s3_seniorityFit(STUDENT_RESUME, 'software-engineer-intern')
    expect(result.screenerID).toBe('s3')
    expect(result.score).toBeGreaterThanOrEqual(80)
  })

  it('senior resume scores lower for software-engineer-intern', () => {
    const result = s3_seniorityFit(SENIOR_RESUME, 'software-engineer-intern')
    expect(result.score).toBeLessThan(70)
  })

  it('analyst resume scores well for data-analyst', () => {
    const result = s3_seniorityFit(ANALYST_RESUME, 'data-analyst')
    expect(result.score).toBeGreaterThanOrEqual(85)
  })

  it('always returns valid shape', () => {
    const result = s3_seniorityFit('Some text', 'business-analyst')
    expect(result.screenerID).toBe('s3')
    expect(result.score).toBeGreaterThanOrEqual(0)
    expect(result.score).toBeLessThanOrEqual(100)
    expect(Array.isArray(result.deductions)).toBe(true)
    expect(result.deductions.length).toBeGreaterThanOrEqual(1)
  })
})
