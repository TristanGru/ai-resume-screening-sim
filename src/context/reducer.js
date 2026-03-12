import { runAllScreeners } from '../screeners/index.js'

export const initialState = {
  role: null,
  jdText: '',
  currentResumeText: '',
  moveHistory: [],
  movesRemaining: 6,
}

export function reducer(state, action) {
  switch (action.type) {
    case 'SET_ROLE':
      return { ...state, role: action.payload.role }

    case 'SET_JD':
      return { ...state, jdText: action.payload.jdText }

    case 'RUN_SCREENERS': {
      const resumeText = action.payload.resumeText
      const { results, robustScore } = runAllScreeners(resumeText, state.role, state.jdText)
      const record = {
        moveIndex: 0,
        resumeSnapshot: resumeText,
        results,
        robustScore,
      }
      return {
        ...state,
        currentResumeText: resumeText,
        moveHistory: [record],
        movesRemaining: 6,
      }
    }

    case 'UPDATE_RESUME':
      return { ...state, currentResumeText: action.payload.resumeText }

    case 'RERUN_SCREENERS': {
      if (state.movesRemaining <= 0) return state
      const { results, robustScore } = runAllScreeners(
        state.currentResumeText,
        state.role,
        state.jdText
      )
      const record = {
        moveIndex: state.moveHistory.length,
        resumeSnapshot: state.currentResumeText,
        results,
        robustScore,
      }
      return {
        ...state,
        moveHistory: [...state.moveHistory, record],
        movesRemaining: state.movesRemaining - 1,
      }
    }

    case 'RESET':
      return { ...initialState }

    default:
      return state
  }
}
