import { create } from 'zustand';
import { FoodEntry } from '../types/database';
import * as foodEntryRepo from '../db/repositories/foodEntryRepository';
import { useSettingsStore } from './useSettingsStore';

interface DashboardState {
  todayCalories: number;
  weekCalories: number;
  weekDayCount: number;
  todayEntries: FoodEntry[];
  isLoading: boolean;

  loadDashboard: () => Promise<void>;
}

export const useDashboardStore = create<DashboardState>((set) => ({
  todayCalories: 0,
  weekCalories: 0,
  weekDayCount: 0,
  todayEntries: [],
  isLoading: true,

  loadDashboard: async () => {
    try {
      const [todayCalories, weekCalories, weekDayCount, todayEntries] =
        await Promise.all([
          foodEntryRepo.getTodayCalories(),
          foodEntryRepo.getWeekCalories(),
          foodEntryRepo.getWeekDayCount(),
          foodEntryRepo.getTodayEntries(),
        ]);

      // Ensure settings are loaded
      const settingsStore = useSettingsStore.getState();
      if (settingsStore.isLoading) {
        await settingsStore.loadSettings();
      }

      set({
        todayCalories,
        weekCalories,
        weekDayCount,
        todayEntries,
        isLoading: false,
      });
    } catch {
      set({ isLoading: false });
    }
  },
}));
