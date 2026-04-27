import { describe, it, expect } from 'vitest'
import { reducer, initialState } from '../src/context/reducer.js'

const sampleResume = `Jane Smith
jane.smith@email.com | (555) 123-4567
Experience
- Built REST API using Python and Flask, reducing latency by 40%
- Developed SQL queries to analyze large datasets
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
    expect(state.gamePhase).toBe('guided')
    expect(state.currentRound).toBe(1)
  })

  it('RUN_SCREENERS populates moveHistory and sets currentResumeText', () => {
    let state = reducer(initialState, { type: 'SET_ROLE', payload: { role: 'data-analyst' } })
    state = reducer(state, { type: 'RUN_SCREENERS', payload: { resumeText: sampleResume } })
    expect(state.moveHistory).toHaveLength(1)
    expect(state.moveHistory[0].moveIndex).toBe(0)
    expect(state.moveHistory[0].results).toHaveLength(5)
    expect(state.currentResumeText).toBe(sampleResume)
    expect(state.gamePhase).toBe('guided')
    expect(state.currentRound).toBe(1)
    expect(state.explorationBaseline).toBeNull()
  })

  it('UPDATE_RESUME updates currentResumeText', () => {
    const state = reducer(initialState, { type: 'UPDATE_RESUME', payload: { resumeText: 'new text' } })
    expect(state.currentResumeText).toBe('new text')
  })

  it('RERUN_SCREENERS advances round and appends to moveHistory', () => {
    let state = reducer(initialState, { type: 'SET_ROLE', payload: { role: 'data-analyst' } })
    state = reducer(state, { type: 'RUN_SCREENERS', payload: { resumeText: sampleResume } })
    state = reducer(state, { type: 'UPDATE_RESUME', payload: { resumeText: sampleResume + '\nSQL' } })
    state = reducer(state, { type: 'RERUN_SCREENERS' })
    expect(state.moveHistory).toHaveLength(2)
    expect(state.moveHistory[1].moveIndex).toBe(1)
    expect(state.currentRound).toBe(2)
    expect(state.gamePhase).toBe('guided')
  })

  it('RERUN_SCREENERS transitions to exploration after round 3 and sets explorationBaseline', () => {
    let state = {
      ...initialState,
      role: 'data-analyst',
      currentResumeText: sampleResume,
      gamePhase: 'guided',
      currentRound: 3,
      moveHistory: [{ moveIndex: 0, resumeSnapshot: sampleResume, results: [], robustScore: 50 }],
    }
    state = reducer(state, { type: 'RERUN_SCREENERS' })
    expect(state.gamePhase).toBe('exploration')
    expect(state.moveHistory).toHaveLength(2)
    expect(typeof state.explorationBaseline).toBe('number')
  })

  it('RERUN_SCREENERS in exploration increments explorationMoves', () => {
    let state = {
      ...initialState,
      role: 'data-analyst',
      currentResumeText: sampleResume,
      gamePhase: 'exploration',
      explorationMoves: 2,
      explorationBaseline: 50,
      moveHistory: [{ moveIndex: 0, resumeSnapshot: sampleResume, results: [], robustScore: 50 }],
    }
    state = reducer(state, { type: 'RERUN_SCREENERS' })
    expect(state.explorationMoves).toBe(3)
    expect(state.gamePhase).toBe('exploration')
  })

  it('RERUN_SCREENERS transitions to complete after 5 exploration moves', () => {
    let state = {
      ...initialState,
      role: 'data-analyst',
      currentResumeText: sampleResume,
      gamePhase: 'exploration',
      explorationMoves: 4,
      explorationBaseline: 50,
      moveHistory: [{ moveIndex: 0, resumeSnapshot: sampleResume, results: [], robustScore: 50 }],
    }
    state = reducer(state, { type: 'RERUN_SCREENERS' })
    expect(state.explorationMoves).toBe(5)
    expect(state.gamePhase).toBe('complete')
  })

  it('RESET returns to initialState', () => {
    let state = reducer(initialState, { type: 'SET_ROLE', payload: { role: 'data-analyst' } })
    state = reducer(state, { type: 'RUN_SCREENERS', payload: { resumeText: sampleResume } })
    state = reducer(state, { type: 'RESET' })
    expect(state).toEqual(initialState)
  })
})
