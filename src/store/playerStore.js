import { create } from 'zustand'

// Minimal player store — ready for external integration.
// Name, XP, badges and streaks are intentionally removed here;
// the host app will inject those via its own auth/profile system.
export const usePlayerStore = create((set) => ({
  grade: null,          // set by host app
  isLoggedIn: false,

  // ── Actions ──────────────────────────────────────────────────────
  login: (grade) => set({ grade, isLoggedIn: true }),
  logout: () => set({ grade: null, isLoggedIn: false }),
}))
