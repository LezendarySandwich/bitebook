import { ToolResult } from '../../types/llm';
import * as settingsRepo from '../../db/repositories/settingsRepository';

export async function getTargetCalories(): Promise<ToolResult> {
  try {
    const target = await settingsRepo.getCalorieTarget();

    return {
      tool: 'getTargetCalories',
      success: true,
      data: { targetCalories: target },
    };
  } catch (error) {
    return {
      tool: 'getTargetCalories',
      success: false,
      data: null,
      error: error instanceof Error ? error.message : 'Failed to get target',
    };
  }
}
