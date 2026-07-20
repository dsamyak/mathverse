import { create } from 'zustand'

export const useWorldStore = create((set, get) => ({
  // Current location
  currentRealmId: null,
  currentDistrictId: null,
  currentNodeId: null,

  // Camera & UI modes
  cameraMode: 'cinematic', // 'cinematic' | 'follow' | 'orbit'
  uiMode: 'world',         // 'world' | 'quiz' | 'dashboard' | 'cutscene' | 'map'

  // Avatar
  avatarPosition: [0, 0, 0],

  // Progress (skillNodeId → status)
  progress: {},

  // Active quiz/cutscene data
  activeNodeId: null,
  pendingUnlocks: [],

  // Settings
  reducedMotion: false,
  qualityLevel: 'high', // 'high' | 'medium' | 'low'
  textFallback: false,
  captions: false,

  // ── Actions ──────────────────────────────────────────────────────

  setCameraMode: (mode) => set({ cameraMode: mode }),

  setUiMode: (mode) => set({ uiMode: mode }),

  setCurrentRealm: (realmId) => set({
    currentRealmId: realmId,
    currentDistrictId: null,
    cameraMode: 'cinematic',
  }),

  setCurrentDistrict: (districtId) => set({ currentDistrictId: districtId }),

  setAvatarPosition: (pos) => set({ avatarPosition: pos }),

  enterSkillNode: (nodeId) => set({
    activeNodeId: nodeId,
    uiMode: 'quiz',
  }),

  exitSkillNode: () => set({
    activeNodeId: null,
    uiMode: 'world',
  }),

  applyUnlocks: (unlocks) => set((state) => {
    const newProgress = { ...state.progress }
    unlocks.forEach(u => {
      newProgress[u.nodeId] = u.status
    })
    return { progress: newProgress, pendingUnlocks: unlocks }
  }),

  updateNodeStatus: (nodeId, status) => set((state) => ({
    progress: { ...state.progress, [nodeId]: status }
  })),

  clearPendingUnlocks: () => set({ pendingUnlocks: [] }),

  setReducedMotion: (v) => set({ reducedMotion: v }),
  setQualityLevel: (v) => set({ qualityLevel: v }),
  setTextFallback: (v) => set({ textFallback: v }),
  setCaptions: (v) => set({ captions: v }),
}))
