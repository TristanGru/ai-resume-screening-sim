import { ACHIEVEMENTS } from '../context/reducer.js'

const STORAGE_KEY = 'ats_sim_leaderboard_v1'
const MAX_ENTRIES = 10

export function computeLeaderboardScore(robustScore, achievements) {
  const bonus = achievements.reduce((sum, id) => sum + (ACHIEVEMENTS[id]?.points ?? 0), 0)
  return robustScore + bonus
}

export function getLeaderboard() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function addLeaderboardEntry(name, robustScore, achievements) {
  const score = computeLeaderboardScore(robustScore, achievements)
  const entries = getLeaderboard()
  entries.push({
    name: name.slice(0, 30),
    score,
    robustScore,
    achievementCount: achievements.length,
    date: new Date().toLocaleDateString(),
  })
  entries.sort((a, b) => b.score - a.score)
  const trimmed = entries.slice(0, MAX_ENTRIES)
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed))
  } catch {
    // localStorage unavailable — still return sorted list
  }
  return trimmed
}
