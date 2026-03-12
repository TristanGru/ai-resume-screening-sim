import { describe, it, expect } from 'vitest'
import { s2_keywordMatch } from '../../src/screeners/s2_keywordMatch.js'

const KEYWORD_RICH = `Jane Smith
Experience
- Developed Python and SQL pipelines for ETL and data cleaning
- Created Tableau dashboards and Power BI reports for analysis and visualization
- Used Excel and pandas for data analysis
- Applied regression and statistics with R and matplotlib
Skills
Python, SQL, Excel, Tableau, Power BI, ETL, dashboard, analysis, visualization`

const SPARSE = `Bob Williams
I worked at a company and did various tasks.`

describe('s2_keywordMatch', () => {
  it('keyword-rich resume scores high for data-analyst', () => {
    const result = s2_keywordMatch(KEYWORD_RICH, 'data-analyst')
    expect(result.screenerID).toBe('s2')
    expect(result.score).toBeGreaterThanOrEqual(70)
  })

  it('sparse resume scores low', () => {
    const result = s2_keywordMatch(SPARSE, 'data-analyst')
    expect(result.score).toBeLessThanOrEqual(40)
  })

  it('matching is case-insensitive (EC-001)', () => {
    const result = s2_keywordMatch(KEYWORD_RICH.toUpperCase(), 'data-analyst')
    expect(result.score).toBeGreaterThan(0)
  })

  it('JD text merges into required keywords', () => {
    const resultNoJD = s2_keywordMatch(SPARSE, 'data-analyst', '')
    const resultWithJD = s2_keywordMatch(SPARSE + '\nworked on various things', 'data-analyst', 'worked various things')
    // Score should be same or higher with JD that matches resume
    expect(resultWithJD.score).toBeGreaterThanOrEqual(resultNoJD.score)
  })

  it('empty JD does not crash (EC-005)', () => {
    const result = s2_keywordMatch(SPARSE, 'data-analyst', '')
    expect(result.score).toBeGreaterThanOrEqual(0)
    expect(result.score).toBeLessThanOrEqual(100)
  })

  it('returns valid ScreenerResult shape', () => {
    const result = s2_keywordMatch(SPARSE, 'software-engineer-intern')
    expect(result.screenerID).toBe('s2')
    expect(result.name).toBeTruthy()
    expect(Array.isArray(result.deductions)).toBe(true)
    expect(result.deductions.length).toBeGreaterThanOrEqual(1)
    expect(result.suggestion).toBeTruthy()
  })

  it('keyword-stuffed resume scores higher than sparse on S2 (AT-003 precondition)', () => {
    const stuffed = SPARSE + '\nSQL Python Excel Tableau Power BI ETL dashboard analysis visualization data cleaning R Snowflake'
    const stuffedResult = s2_keywordMatch(stuffed, 'data-analyst')
    const sparseResult = s2_keywordMatch(SPARSE, 'data-analyst')
    expect(stuffedResult.score).toBeGreaterThan(sparseResult.score)
  })
})
