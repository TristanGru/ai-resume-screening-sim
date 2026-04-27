import { ACHIEVEMENTS } from '../context/reducer.js'

const STORAGE_VERSION = 'ats_sim_lb_v3'
const MAX_ENTRIES = 10

function storageKey(role) {
  return `${STORAGE_VERSION}_${role}`
}

export function computeLeaderboardScore(robustScore, achievements) {
  const bonus = achievements.reduce((sum, id) => sum + (ACHIEVEMENTS[id]?.points ?? 0), 0)
  return robustScore + bonus
}

export function getLeaderboard(role) {
  try {
    const raw = localStorage.getItem(storageKey(role))
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function addLeaderboardEntry(name, robustScore, achievements, role) {
  const score = computeLeaderboardScore(robustScore, achievements)
  const entries = getLeaderboard(role)
  entries.push({
    name: name.slice(0, 30),
    score,
    robustScore,
    achievementCount: achievements.length,
    role,
    date: new Date().toLocaleDateString(),
  })
  entries.sort((a, b) => b.score - a.score)
  const trimmed = entries.slice(0, MAX_ENTRIES)
  try {
    localStorage.setItem(storageKey(role), JSON.stringify(trimmed))
  } catch {
    // localStorage unavailable — still return sorted list
  }
  return trimmed
}
