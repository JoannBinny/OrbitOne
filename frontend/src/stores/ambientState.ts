import { create } from "zustand";

export type AmbientState =
  | "idle"
  | "listening"
  | "thinking"
  | "working"
  | "waiting_for_approval"
  | "completing"
  | "complete"
  | "error";

interface AmbientStore {
  state: AmbientState;
  set: (state: AmbientState) => void;
  reset: () => void;
}

/**
 * Single global source of truth for the environment's visual mood.
 * This is purely presentational — it must never be treated as proof that a
 * backend action happened. Components derive it FROM real query/mutation
 * state (agent run status, pending approvals, mutation errors), they don't
 * set it arbitrarily. See orbitone-component-patterns §6.
 */
export const useAmbientStore = create<AmbientStore>((set) => ({
  state: "idle",
  set: (state) => set({ state }),
  reset: () => set({ state: "idle" }),
}));
