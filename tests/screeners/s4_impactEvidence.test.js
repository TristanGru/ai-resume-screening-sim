import { describe, it, expect } from 'vitest'
import { s4_impactEvidence } from '../../src/screeners/s4_impactEvidence.js'

const STRONG_RESUME = `Jane Smith
Experience
- Developed REST API, reducing latency by 40%
- Built data pipeline processing 500,000 rows daily
- Optimized SQL queries, improving performance by 30%
- Delivered 3 features per sprint across 6-month project
- Implemented automated testing, achieving 85% coverage
- Led migration to cloud infrastructure saving $50,000/year`

const WEAK_RESUME = `Bob Williams
Experience
- Responsible for various tasks at the company
- Helped with team meetings and coordination
- Worked on database maintenance
- Assisted with reporting needs`

const SPARSE_RESUME = `Jane Smith
I have worked at companies doing various work.`

const ANALYST_ADMIN_RESUME = `Jordan Lee
Experience
- Gathered project requirements from 6 team members to improve client planning documentation and reduce missing information
- Coordinated with 4 internal stakeholders to track follow-ups and complete action items before weekly project deadlines
- Documented user stories from 8 weekly meetings to support Agile sprint planning and improve handoff clarity
- Prepared 3 monthly status updates summarizing project progress, risks, KPIs, and next steps for department leadership
- Reviewed 5 Excel reports and basic SQL outputs to identify workflow issues and support process improvement recommendations
- Updated 20+ Jira task records and Confluence project notes to document sprint progress, open questions, and gap analysis findings
- Completed gap analysis on 10 project requirements to identify missing documentation and improve workflow visibility
- Managed 40+ weekly inquiries by clarifying needs and directing individuals to the correct campus resources
- Organized 100+ office records to improve document access and reduce time spent searching for administrative materials
- Tracked schedules and follow-ups for 5 recurring center programs to keep planning tasks organized across the year
Projects
- Built an Excel-based dashboard to track donations, expenses, and remaining funds for 1 organization across the semester
- Collected budget requirements from 3 officers to define expense categories, reporting fields, and tracking needs
- Organized 50+ transactions using spreadsheet formulas and SQL-style filtering logic to summarize spending trends
- Created an end-of-semester financial report tracking 4 budget KPIs to help leadership review spending decisions`

describe('s4_impactEvidence', () => {
  it('strong resume with numbers and action verbs scores high', () => {
    const result = s4_impactEvidence(STRONG_RESUME)
    expect(result.screenerID).toBe('s4')
    expect(result.score).toBeGreaterThanOrEqual(70)
  })

  it('weak phrases reduce score', () => {
    const result = s4_impactEvidence(WEAK_RESUME)
    expect(result.score).toBeLessThan(60)
    const mentionsWeak = result.deductions.some((d) =>
      d.toLowerCase().includes('weak') || d.toLowerCase().includes('responsible')
    )
    expect(mentionsWeak).toBe(true)
  })

  it('sparse resume with no numbers scores low', () => {
    const result = s4_impactEvidence(SPARSE_RESUME)
    expect(result.score).toBeLessThan(70)
  })

  it('credits quantified analyst and administrative bullets as strong evidence', () => {
    const result = s4_impactEvidence(ANALYST_ADMIN_RESUME)
    expect(result.score).toBeGreaterThanOrEqual(90)
    expect(result.deductions.some((d) => d.includes('more than 4 bullets'))).toBe(true)
  })

  it('score is always 0–100', () => {
    const result = s4_impactEvidence('')
    expect(result.score).toBeGreaterThanOrEqual(0)
    expect(result.score).toBeLessThanOrEqual(100)
  })

  it('returns valid ScreenerResult shape', () => {
    const result = s4_impactEvidence(SPARSE_RESUME)
    expect(result.screenerID).toBe('s4')
    expect(result.name).toBeTruthy()
    expect(Array.isArray(result.deductions)).toBe(true)
    expect(result.suggestion).toBeTruthy()
  })
})
