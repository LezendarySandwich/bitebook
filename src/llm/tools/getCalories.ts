import { ToolResult } from '../../types/llm';
import * as foodEntryRepo from '../../db/repositories/foodEntryRepository';

export async function getCalories(params: Record<string, unknown>): Promise<ToolResult> {
  try {
    const period = params.period as string;

    let total: number;
    switch (period) {
      case 'today':
        total = await foodEntryRepo.getTodayCalories();
        break;
      case 'this_week':
        total = await foodEntryRepo.getWeekCalories();
        break;
      case 'last_week':
        total = await foodEntryRepo.getLastWeekCalories();
        break;
      default:
        total = await foodEntryRepo.getTodayCalories();
    }

    const todayEntries = period === 'today' ? await foodEntryRepo.getTodayEntries() : [];

    return {
      tool: 'getCalories',
      success: true,
      data: {
        period: period || 'today',
        totalCalories: total,
        entries: todayEntries.map((e) => ({
          name: e.name,
          calories: e.calories,
          quantity: e.quantity,
        })),
      },
    };
  } catch (error) {
    return {
      tool: 'getCalories',
      success: false,
      data: null,
      error: error instanceof Error ? error.message : 'Failed to get calories',
    };
  }
}
