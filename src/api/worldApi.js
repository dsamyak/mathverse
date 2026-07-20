import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { REALMS, DISTRICTS, SKILL_NODES, INITIAL_PROGRESS } from './mockData'

// ── Simulated network delay ───────────────────────────────────────
const delay = (ms = 200) => new Promise(resolve => setTimeout(resolve, ms))

// ── In-memory mutable progress store ─────────────────────────────
let _progress = { ...INITIAL_PROGRESS }

// ══════════════════════════════════════════════════════════════════
// World Map
// ══════════════════════════════════════════════════════════════════
export const useWorldMap = () =>
  useQuery({
    queryKey: ['worldMap'],
    queryFn: async () => {
      await delay(150)
      return REALMS.map(r => ({
        ...r,
        districts: (r.districts || []).map(dId => ({
          ...DISTRICTS[dId],
          nodes: (DISTRICTS[dId]?.nodes || []).map(nId => ({
            ...SKILL_NODES[nId],
            status: _progress[nId] || 'locked',
          })),
        })),
      }))
    },
    staleTime: 30_000,
  })

// ══════════════════════════════════════════════════════════════════
// Single Realm
// ══════════════════════════════════════════════════════════════════
export const useRealm = (realmId) =>
  useQuery({
    queryKey: ['realm', realmId],
    queryFn: async () => {
      await delay(100)
      const realm = REALMS.find(r => r.id === realmId)
      if (!realm) throw new Error(`Realm ${realmId} not found`)
      return {
        ...realm,
        districts: (realm.districts || []).map(dId => ({
          ...DISTRICTS[dId],
          nodes: (DISTRICTS[dId]?.nodes || []).map(nId => ({
            ...SKILL_NODES[nId],
            status: _progress[nId] || 'locked',
          })),
        })),
      }
    },
    enabled: !!realmId,
    staleTime: 30_000,
  })

// ══════════════════════════════════════════════════════════════════
// Single Skill Node
// ══════════════════════════════════════════════════════════════════
export const useSkillNode = (nodeId) =>
  useQuery({
    queryKey: ['skillNode', nodeId],
    queryFn: async () => {
      await delay(80)
      const node = SKILL_NODES[nodeId]
      if (!node) throw new Error(`Node ${nodeId} not found`)
      return { ...node, status: _progress[nodeId] || 'locked' }
    },
    enabled: !!nodeId,
  })

// ══════════════════════════════════════════════════════════════════
// Submit Attempt (mastery check)
// ══════════════════════════════════════════════════════════════════
export const useSubmitAttempt = () => {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: async ({ nodeId, answers }) => {
      await delay(400) // simulate server round-trip

      const node = SKILL_NODES[nodeId]
      if (!node) throw new Error('Node not found')

      // Score the attempt
      let correct = 0
      answers.forEach(({ questionId, answer }) => {
        const q = node.questions.find(q => q.id === questionId)
        if (!q) return
        // Normalize: drag answers are arrays in mockData, stored as joined string
        const normalizedCorrect = Array.isArray(q.answer) ? q.answer.join(',') : q.answer
        if (normalizedCorrect === answer) correct++
      })

      const total = node.questions.length
      const score = Math.round((correct / total) * 100)
      const mastered = score >= 80

      // Determine unlocks
      const newUnlocks = []
      if (mastered && _progress[nodeId] !== 'mastered') {
        _progress[nodeId] = 'mastered'
        newUnlocks.push({ nodeId, status: 'mastered' })

        // Check if next node in district unlocks
        const district = DISTRICTS[node.districtId]
        if (district) {
          const idx = district.nodes.indexOf(nodeId)
          if (idx >= 0 && idx < district.nodes.length - 1) {
            const nextNodeId = district.nodes[idx + 1]
            if (_progress[nextNodeId] === 'locked') {
              _progress[nextNodeId] = 'available'
              newUnlocks.push({ nodeId: nextNodeId, status: 'available' })
            }
          }
        }
      }

      return {
        score,
        correct,
        total,
        mastered,
        xpGained: mastered ? node.xpReward : Math.round(node.xpReward * 0.3),
        newUnlocks,
        feedback: mastered
          ? '🌟 Excellent work! You\'ve mastered this concept!'
          : score >= 60
            ? '👍 Good effort! Review the hint and try again — you\'re close!'
            : '💡 No worries! Let\'s revisit the concept and try once more.',
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['worldMap'] })
      qc.invalidateQueries({ queryKey: ['realm'] })
      qc.invalidateQueries({ queryKey: ['skillNode'] })
    },
  })
}

// ══════════════════════════════════════════════════════════════════
// Student Progress
// ══════════════════════════════════════════════════════════════════
export const useStudentProgress = () =>
  useQuery({
    queryKey: ['studentProgress'],
    queryFn: async () => {
      await delay(100)
      const mastered = Object.values(_progress).filter(s => s === 'mastered').length
      const total = Object.keys(_progress).length
      return {
        progress: { ..._progress },
        masteredCount: mastered,
        totalCount: total,
        masteryPercent: Math.round((mastered / total) * 100),
        recentActivity: [
          { nodeId: 'node_frac_intro_3', status: 'mastered', at: new Date(Date.now() - 86400000) },
          { nodeId: 'node_frac_intro_2', status: 'mastered', at: new Date(Date.now() - 2 * 86400000) },
          { nodeId: 'node_times_3', status: 'mastered', at: new Date(Date.now() - 3 * 86400000) },
        ],
      }
    },
    staleTime: 10_000,
  })
