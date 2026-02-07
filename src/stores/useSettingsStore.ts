import { create } from 'zustand';
import * as settingsRepo from '../db/repositories/settingsRepository';

interface SettingsState {
  calorieTarget: number;
  isLoading: boolean;
  loadSettings: () => Promise<void>;
  setCalorieTarget: (target: number) => Promise<void>;
}

export const useSettingsStore = create<SettingsState>((set) => ({
  calorieTarget: 2000,
  isLoading: true,

  loadSettings: async () => {
    try {
      const target = await settingsRepo.getCalorieTarget();
      set({ calorieTarget: target, isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },

  setCalorieTarget: async (target: number) => {
    await settingsRepo.setCalorieTarget(target);
    set({ calorieTarget: target });
  },
}));
