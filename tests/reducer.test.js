import { describe, it, expect } from 'vitest'
import { reducer, initialState } from '../src/context/reducer.js'

const sampleResume = `Jane Smith
Experience
- Built REST API using Python and Flask
- Developed SQL queries to analyze datasets
Education
B.S. Computer Science, University of Virginia, May 2024
Skills
Python, SQL, React, Git, data structures
Projects
Resume Parser Tool — JavaScript and React web app`

describe('reducer', () => {
  it('SET_ROLE updates role', () => {
    const state = reducer(initialState, { type: 'SET_ROLE', payload: { role: 'data-analyst' } })
    expect(state.role).toBe('data-analyst')
    expect(state.movesRemaining).toBe(6)
  })

  it('SET_JD updates jdText', () => {
    const state = reducer(initialState, { type: 'SET_JD', payload: { jdText: 'Looking for a data analyst' } })
    expect(state.jdText).toBe('Looking for a data analyst')
  })

  it('RUN_SCREENERS populates moveHistory and sets currentResumeText', () => {
    let state = reducer(initialState, { type: 'SET_ROLE', payload: { role: 'data-analyst' } })
    state = reducer(state, { type: 'RUN_SCREENERS', payload: { resumeText: sampleResume } })
    expect(state.moveHistory).toHaveLength(1)
    expect(state.moveHistory[0].moveIndex).toBe(0)
    expect(state.moveHistory[0].results).toHaveLength(5)
    expect(state.currentResumeText).toBe(sampleResume)
    expect(state.movesRemaining).toBe(6)
  })

  it('UPDATE_RESUME updates currentResumeText', () => {
    const state = reducer(initialState, { type: 'UPDATE_RESUME', payload: { resumeText: 'new text' } })
    expect(state.currentResumeText).toBe('new text')
  })

  it('RERUN_SCREENERS appends to moveHistory and decrements movesRemaining', () => {
    let state = reducer(initialState, { type: 'SET_ROLE', payload: { role: 'data-analyst' } })
    state = reducer(state, { type: 'RUN_SCREENERS', payload: { resumeText: sampleResume } })
    state = reducer(state, { type: 'UPDATE_RESUME', payload: { resumeText: sampleResume + '\nSQL' } })
    state = reducer(state, { type: 'RERUN_SCREENERS' })
    expect(state.moveHistory).toHaveLength(2)
    expect(state.moveHistory[1].moveIndex).toBe(1)
    expect(state.movesRemaining).toBe(5)
  })

  it('RERUN_SCREENERS does not go below 0 moves', () => {
    let state = { ...initialState, role: 'data-analyst', currentResumeText: sampleResume, movesRemaining: 0, moveHistory: [{ moveIndex: 0, resumeSnapshot: sampleResume, results: [], robustScore: 50 }] }
    state = reducer(state, { type: 'RERUN_SCREENERS' })
    expect(state.movesRemaining).toBe(0)
    expect(state.moveHistory).toHaveLength(1)
  })

  it('RESET returns to initialState', () => {
    let state = reducer(initialState, { type: 'SET_ROLE', payload: { role: 'data-analyst' } })
    state = reducer(state, { type: 'RUN_SCREENERS', payload: { resumeText: sampleResume } })
    state = reducer(state, { type: 'RESET' })
    expect(state).toEqual(initialState)
  })
})
