import { runAllScreeners } from '../screeners/index.js'

export const initialState = {
  role: null,
  currentResumeText: '',
  moveHistory: [],
  gamePhase: 'guided',       // 'guided' | 'exploration' | 'complete'
  currentRound: 1,            // 1 | 2 | 3 during guided phase
  achievements: [],
  explorationMoves: 0,        // re-runs made in exploration (max 5)
  explorationEdits: 0,        // actual text changes made in exploration (for Explorer achievement)
  explorationBaseline: null,  // robustScore at start of exploration (for Comeback Kid)
}

export const ACHIEVEMENTS = {
  structure_ace: {
    label: 'Structure Ace',
    desc: 'Achieved 85+ on ATS Parser — clean, parseable formatting.',
    requirement: 'Get ATS Parser to 85+',
    points: 5,
    icon: '📋',
  },
  keyword_master: {
    label: 'Keyword Master',
    desc: 'Achieved 80+ on Keyword Match — strong role alignment.',
    requirement: 'Get Keyword Match to 80+',
    points: 5,
    icon: '🔑',
  },
  right_fit: {
    label: 'Right Fit',
    desc: 'Achieved 80+ on Seniority Fit — your signals match the role.',
    requirement: 'Get Seniority Fit to 80+',
    points: 5,
    icon: '🎯',
  },
  impact_star: {
    label: 'Impact Star',
    desc: 'Achieved 80+ on Impact & Evidence — compelling accomplishment bullets.',
    requirement: 'Get Impact & Evidence to 80+',
    points: 5,
    icon: '📈',
  },
  clean_climber: {
    label: 'Clean Climber',
    desc: 'Held Keyword Match ≥ 70 and Spam Risk ≥ 85 simultaneously — keywords without stuffing.',
    requirement: 'Get Keyword Match ≥ 70 AND Spam Risk ≥ 85 at the same time',
    points: 10,
    icon: '✨',
  },
  conflict_found: {
    label: 'Conflict Finder',
    desc: 'Discovered the Keyword/Spam tradeoff — S2 and S5 moved in opposite directions.',
    requirement: 'Make S2 and S5 move in opposite directions in one run',
    points: 5,
    icon: '⚡',
  },
  high_scorer: {
    label: 'High Scorer',
    desc: 'Finished with a Robust Score of 80 or above.',
    requirement: 'Reach a Robust Score of 80+',
    points: 10,
    icon: '🏆',
  },
  comeback: {
    label: 'Comeback Kid',
    desc: 'Improved Robust Score by 20+ points from your exploration baseline.',
    requirement: 'Gain 20+ Robust Score points during Exploration',
    points: 10,
    icon: '🚀',
  },
  explorer: {
    label: 'Explorer',
    desc: 'Made 3 or more edits in Exploration Mode.',
    requirement: 'Make 3+ edits in Exploration Mode',
    points: 5,
    icon: '🗺️',
  },
}

function checkAchievements(state, newResults, robustScore) {
  const earned = [...state.achievements]

  const s1 = newResults.find((r) => r.screenerID === 's1')?.score ?? 0
  const s2 = newResults.find((r) => r.screenerID === 's2')?.score ?? 0
  const s3 = newResults.find((r) => r.screenerID === 's3')?.score ?? 0
  const s4 = newResults.find((r) => r.screenerID === 's4')?.score ?? 0
  const s5 = newResults.find((r) => r.screenerID === 's5')?.score ?? 0

  if (s1 >= 85 && !earned.includes('structure_ace')) earned.push('structure_ace')
  if (s2 >= 80 && !earned.includes('keyword_master')) earned.push('keyword_master')
  if (s3 >= 80 && !earned.includes('right_fit')) earned.push('right_fit')
  if (s4 >= 80 && !earned.includes('impact_star')) earned.push('impact_star')
  if (s2 >= 70 && s5 >= 85 && !earned.includes('clean_climber')) earned.push('clean_climber')
  if (robustScore >= 80 && !earned.includes('high_scorer')) earned.push('high_scorer')

  // conflict_found: S2 and S5 moved in opposite directions vs previous run
  if (state.moveHistory.length > 0) {
    const prev = state.moveHistory[state.moveHistory.length - 1].results
    const prevS2 = prev.find((r) => r.screenerID === 's2')?.score ?? 0
    const prevS5 = prev.find((r) => r.screenerID === 's5')?.score ?? 0
    if (
      !earned.includes('conflict_found') &&
      ((s2 > prevS2 && s5 < prevS5) || (s2 < prevS2 && s5 > prevS5))
    ) {
      earned.push('conflict_found')
    }
  }

  // comeback: improved 20+ from exploration baseline
  if (
    state.gamePhase === 'exploration' &&
    state.explorationBaseline !== null &&
    !earned.includes('comeback') &&
    robustScore - state.explorationBaseline >= 20
  ) {
    earned.push('comeback')
  }

  // explorer: 3+ actual text edits in exploration mode
  if (
    state.gamePhase === 'exploration' &&
    state.explorationEdits + 1 >= 3 &&
    !earned.includes('explorer')
  ) {
    earned.push('explorer')
  }

  return earned
}

export function reducer(state, action) {
  switch (action.type) {
    case 'SET_ROLE':
      return { ...state, role: action.payload.role }

    case 'RUN_SCREENERS': {
      const resumeText = action.payload.resumeText
      const { results, robustScore } = runAllScreeners(resumeText, state.role)
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
        explorationBaseline: null,
      }
    }

    case 'UPDATE_RESUME':
      return { ...state, currentResumeText: action.payload.resumeText }

    case 'RERUN_SCREENERS': {
      const { results, robustScore } = runAllScreeners(
        state.currentResumeText,
        state.role,
      )
      const record = {
        moveIndex: state.moveHistory.length,
        resumeSnapshot: state.currentResumeText,
        results,
        robustScore,
      }

      const newAchievements = checkAchievements(state, results, robustScore)

      let newPhase = state.gamePhase
      let newRound = state.currentRound
      let newExplorationMoves = state.explorationMoves
      let newExplorationEdits = state.explorationEdits
      let newExplorationBaseline = state.explorationBaseline

      if (state.gamePhase === 'guided') {
        if (state.currentRound < 3) {
          newRound = state.currentRound + 1
        } else {
          newPhase = 'exploration'
          newRound = 3
          newExplorationBaseline = robustScore
        }
      } else if (state.gamePhase === 'exploration') {
        newExplorationMoves = state.explorationMoves + 1
        const lastSnapshot = state.moveHistory[state.moveHistory.length - 1]?.resumeSnapshot ?? ''
        if (state.currentResumeText !== lastSnapshot) {
          newExplorationEdits = state.explorationEdits + 1
        }
        if (newExplorationMoves >= 5) {
          newPhase = 'complete'
        }
      }

      return {
        ...state,
        moveHistory: [...state.moveHistory, record],
        gamePhase: newPhase,
        currentRound: newRound,
        achievements: newAchievements,
        explorationMoves: newExplorationMoves,
        explorationEdits: newExplorationEdits,
        explorationBaseline: newExplorationBaseline,
      }
    }

    case 'RESET':
      return { ...initialState }

    default:
      return state
  }
}
