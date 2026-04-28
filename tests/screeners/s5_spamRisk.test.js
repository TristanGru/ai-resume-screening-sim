import { describe, it, expect } from 'vitest'
import { s5_spamRisk } from '../../src/screeners/s5_spamRisk.js'

const CLEAN_RESUME = `Jane Smith
Experience
- Built REST API using Python reducing latency by 40%
- Developed SQL queries for data analysis
Education
B.S. Computer Science
Skills
Python, SQL, React, Git`

const KEYWORD_STUFFED = `Alex Johnson
Experience
- SQL SQL SQL Python Python Excel Excel Tableau Power BI ETL dashboard analysis visualization data cleaning
- SQL Python Excel Tableau Power BI ETL dashboard analysis SQL Python SQL Python SQL
- SQL Python Excel Tableau dashboard analysis SQL Python Excel dashboard SQL Python
Skills
SQL, Python, Excel, Tableau, Power BI, ETL, dashboard, analysis, visualization, data cleaning, R, Snowflake, dbt, Looker, A/B testing, statistics, regression, pandas, matplotlib, JavaScript, React, API, REST, Git`

const BUZZWORD_HEAVY = `Alex Johnson
I am a results-driven self-starter go-getter team player who is passionate about synergy and leverage.
I am a visionary thought leader with a dynamic and proactive mindset.
I bring holistic value-add and innovative cutting-edge solutions.
Skills
synergy, leverage, paradigm, disruptive, innovative, thought leader, holistic, proactive, dynamic, passionate`

const DENSE_BUT_EVIDENCED = `Jordan Lee
Experience
- Gathered project requirements from 6 team members to improve client planning documentation and reduce missing information
- Coordinated with 4 internal stakeholders to track follow-ups and complete action items before weekly project deadlines
- Documented user stories from 8 weekly meetings to support Agile sprint planning and improve handoff clarity
- Reviewed 5 Excel reports and basic SQL outputs to identify workflow issues and support process improvement recommendations
- Built an Excel-based dashboard to track donations, expenses, and remaining funds for 1 organization across the semester
Skills
Microsoft Excel, Word, PowerPoint, Google Workspace, Outlook, SQL, Requirements Gathering, Stakeholder Communication, Agile Documentation, User Stories, Sprint Support, Dashboard Reporting, KPI Tracking, Process Improvement, Workflow Analysis, Project Coordination, Data Reporting`

describe('s5_spamRisk', () => {
  it('clean resume scores high (≥ 80)', () => {
    const result = s5_spamRisk(CLEAN_RESUME)
    expect(result.screenerID).toBe('s5')
    expect(result.score).toBeGreaterThanOrEqual(80)
  })

  it('keyword-stuffed resume scores low (AT-003 conflict verification)', () => {
    const result = s5_spamRisk(KEYWORD_STUFFED)
    expect(result.score).toBeLessThan(80)
  })

  it('buzzword-heavy resume gets penalized', () => {
    const result = s5_spamRisk(BUZZWORD_HEAVY)
    expect(result.score).toBeLessThan(100)
  })

  it('applies a mild spam penalty to dense skills lists even with evidence', () => {
    const result = s5_spamRisk(DENSE_BUT_EVIDENCED)
    expect(result.score).toBeLessThan(100)
    expect(result.score).toBeGreaterThanOrEqual(90)
    expect(result.deductions.some((d) => d.includes('dense keyword lists'))).toBe(true)
  })

  it('score is always 0–100', () => {
    const result = s5_spamRisk('')
    expect(result.score).toBeGreaterThanOrEqual(0)
    expect(result.score).toBeLessThanOrEqual(100)
  })

  it('returns valid ScreenerResult shape', () => {
    const result = s5_spamRisk(CLEAN_RESUME)
    expect(result.screenerID).toBe('s5')
    expect(result.name).toBeTruthy()
    expect(Array.isArray(result.deductions)).toBe(true)
    expect(result.deductions.length).toBeGreaterThanOrEqual(1)
    expect(result.suggestion).toBeTruthy()
  })

  it('AT-003: keyword stuffing raises S2 but should lower S5', () => {
    // Verified by S2 test (stuffed > sparse on S2) and S5 test (stuffed < clean on S5)
    const cleanResult = s5_spamRisk(CLEAN_RESUME)
    const stuffedResult = s5_spamRisk(KEYWORD_STUFFED)
    expect(stuffedResult.score).toBeLessThan(cleanResult.score)
  })
})
