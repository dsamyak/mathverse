import { create } from 'zustand'

export const usePlayerStore = create((set) => ({
  studentName: 'Alex',
  grade: 4,
  xpTotal: 1240,
  xpDelta: 0, // used to animate XP gain
  badges: ['first_node', 'fraction_hero', 'streak_7'],
  cosmetics: {
    outfit: 'explorer',
    hat: 'astro_helmet',
    companion: 'orbit_bot',
  },
  unlockedRealms: ['realm_grade1', 'realm_grade3', 'realm_grade4'],
  isLoggedIn: true,
  streakDays: 3,
  todayNodesDone: 2,
  sessionStartedAt: Date.now(),

  // ── Actions ──────────────────────────────────────────────────────

  addXP: (amount) => set((state) => ({
    xpTotal: state.xpTotal + amount,
    xpDelta: amount,
  })),

  clearXPDelta: () => set({ xpDelta: 0 }),

  unlockRealm: (realmId) => set((state) => ({
    unlockedRealms: [...new Set([...state.unlockedRealms, realmId])],
  })),

  addBadge: (badge) => set((state) => ({
    badges: [...new Set([...state.badges, badge])],
  })),

  setCosmetic: (key, value) => set((state) => ({
    cosmetics: { ...state.cosmetics, [key]: value },
  })),

  login: (name, grade) => set({ studentName: name, grade, isLoggedIn: true }),

  incrementTodayNodes: () => set((state) => ({
    todayNodesDone: state.todayNodesDone + 1,
  })),
}))
