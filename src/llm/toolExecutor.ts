import { ToolCall, ToolResult } from '../types/llm';
import { logFood, searchWeb, writeNote, getCalories, getTargetCalories } from './tools';

type ToolHandler = (params: Record<string, unknown>) => Promise<ToolResult>;

const toolRegistry: Record<string, ToolHandler> = {
  logFood,
  searchWeb,
  writeNote,
  getCalories,
  getTargetCalories: () => getTargetCalories(),
};

export async function executeToolCall(toolCall: ToolCall): Promise<ToolResult> {
  const handler = toolRegistry[toolCall.tool];

  if (!handler) {
    return {
      tool: toolCall.tool,
      success: false,
      data: null,
      error: `Unknown tool: ${toolCall.tool}`,
    };
  }

  try {
    return await handler(toolCall.params);
  } catch (error) {
    return {
      tool: toolCall.tool,
      success: false,
      data: null,
      error: error instanceof Error ? error.message : 'Tool execution failed',
    };
  }
}

export async function executeToolCalls(
  toolCalls: ToolCall[]
): Promise<ToolResult[]> {
  const results: ToolResult[] = [];
  for (const toolCall of toolCalls) {
    const result = await executeToolCall(toolCall);
    results.push(result);
  }
  return results;
}
