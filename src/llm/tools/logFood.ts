import { ToolResult } from '../../types/llm';
import * as foodEntryRepo from '../../db/repositories/foodEntryRepository';
import { useChatStore } from '../../stores/useChatStore';

export async function logFood(params: Record<string, unknown>): Promise<ToolResult> {
  try {
    const name = params.name as string;
    const calories = params.calories as number;
    const quantity = (params.quantity as number) ?? 1.0;

    if (!name || typeof calories !== 'number') {
      return {
        tool: 'logFood',
        success: false,
        data: null,
        error: 'Missing required parameters: name and calories',
      };
    }

    const conversationId = useChatStore.getState().currentConversationId;
    const entry = await foodEntryRepo.logFoodEntry(
      name,
      calories,
      quantity,
      conversationId ?? undefined
    );

    const todayTotal = await foodEntryRepo.getTodayCalories();

    return {
      tool: 'logFood',
      success: true,
      data: {
        logged: { name, calories, quantity },
        todayTotal,
      },
    };
  } catch (error) {
    return {
      tool: 'logFood',
      success: false,
      data: null,
      error: error instanceof Error ? error.message : 'Failed to log food',
    };
  }
}
