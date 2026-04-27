import { runAllScreeners } from '../screeners/index.js'

export const initialState = {
  role: null,
  jdText: '',
  currentResumeText: '',
  moveHistory: [],
  gamePhase: 'guided',  // 'guided' | 'exploration'
  currentRound: 1,       // 1 | 2 | 3 during guided phase
  achievements: [],      // string[] of earned achievement IDs
  explorationMoves: 0,   // re-runs made in exploration phase
}

// Achievement definitions used by the reducer and UI
export const ACHIEVEMENTS = {
  conflict_found: {
    label: 'Conflict Finder',
    desc: 'Discovered the Keyword/Spam tradeoff — S2 and S5 moved in opposite directions.',
    points: 5,
    icon: '⚡',
  },
  structure_ace: {
    label: 'Structure Ace',
    desc: 'Achieved 85+ on ATS Parser — clean, parseable formatting.',
    points: 5,
    icon: '📋',
  },
  keyword_master: {
    label: 'Keyword Master',
    desc: 'Achieved 80+ on Keyword Match — strong role alignment.',
    points: 5,
    icon: '🔑',
  },
  impact_star: {
    label: 'Impact Star',
    desc: 'Achieved 80+ on Impact & Evidence — compelling accomplishment bullets.',
    points: 5,
    icon: '📈',
  },
  high_scorer: {
    label: 'High Scorer',
    desc: 'Finished with a Robust Score of 80 or above.',
    points: 10,
    icon: '🏆',
  },
  comeback: {
    label: 'Comeback Kid',
    desc: 'Improved Robust Score by 20+ points from the baseline.',
    points: 10,
    icon: '🚀',
  },
  explorer: {
    label: 'Explorer',
    desc: 'Made 3 or more edits in Exploration Mode.',
    points: 5,
    icon: '🗺️',
  },
}

function checkAchievements(state, newResults, robustScore) {
  const earned = [...state.achievements]

  const s1 = newResults.find((r) => r.screenerID === 's1')?.score ?? 0
  const s2 = newResults.find((r) => r.screenerID === 's2')?.score ?? 0
  const s4 = newResults.find((r) => r.screenerID === 's4')?.score ?? 0

  // conflict_found: S2 and S5 moved in opposite directions vs previous run
  if (state.moveHistory.length > 0) {
    const prev = state.moveHistory[state.moveHistory.length - 1].results
    const prevS2 = prev.find((r) => r.screenerID === 's2')?.score ?? 0
    const prevS5 = prev.find((r) => r.screenerID === 's5')?.score ?? 0
    const newS5 = newResults.find((r) => r.screenerID === 's5')?.score ?? 0
    if (
      !earned.includes('conflict_found') &&
      ((s2 > prevS2 && newS5 < prevS5) || (s2 < prevS2 && newS5 > prevS5))
    ) {
      earned.push('conflict_found')
    }
  }

  if (s1 >= 85 && !earned.includes('structure_ace')) earned.push('structure_ace')
  if (s2 >= 80 && !earned.includes('keyword_master')) earned.push('keyword_master')
  if (s4 >= 80 && !earned.includes('impact_star')) earned.push('impact_star')
  if (robustScore >= 80 && !earned.includes('high_scorer')) earned.push('high_scorer')

  // comeback: improved by 20+ from baseline
  if (state.moveHistory.length > 0 && !earned.includes('comeback')) {
    const baselineRobust = state.moveHistory[0].robustScore
    if (robustScore - baselineRobust >= 20) earned.push('comeback')
  }

  // explorer: 3+ edits in exploration mode
  if (state.gamePhase === 'exploration' && state.explorationMoves + 1 >= 3 && !earned.includes('explorer')) {
    earned.push('explorer')
  }

  return earned
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
        gamePhase: 'guided',
        currentRound: 1,
        achievements: [],
        explorationMoves: 0,
      }
    }

    case 'UPDATE_RESUME':
      return { ...state, currentResumeText: action.payload.resumeText }

    case 'RERUN_SCREENERS': {
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

      const newAchievements = checkAchievements(state, results, robustScore)

      // Advance game phase
      let newPhase = state.gamePhase
      let newRound = state.currentRound
      let newExplorationMoves = state.explorationMoves

      if (state.gamePhase === 'guided') {
        if (state.currentRound < 3) {
          newRound = state.currentRound + 1
        } else {
          // Completed round 3 — unlock exploration
          newPhase = 'exploration'
          newRound = 3
        }
      } else {
        newExplorationMoves = state.explorationMoves + 1
      }

      return {
        ...state,
        moveHistory: [...state.moveHistory, record],
        gamePhase: newPhase,
        currentRound: newRound,
        achievements: newAchievements,
        explorationMoves: newExplorationMoves,
      }
    }

    case 'RESET':
      return { ...initialState }

    default:
      return state
  }
}
