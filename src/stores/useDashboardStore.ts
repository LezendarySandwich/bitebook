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
  updateFoodEntry: (id: number, updates: { name?: string; calories?: number; quantity?: number }) => Promise<void>;
  deleteFoodEntry: (id: number) => Promise<void>;
}

export const useDashboardStore = create<DashboardState>((set, get) => ({
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

  updateFoodEntry: async (id, updates) => {
    await foodEntryRepo.updateFoodEntry(id, updates);
    await get().loadDashboard();
  },

  deleteFoodEntry: async (id) => {
    await foodEntryRepo.deleteFoodEntry(id);
    await get().loadDashboard();
  },
}));
