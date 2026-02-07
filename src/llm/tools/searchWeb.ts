import { ToolResult } from '../../types/llm';
import { searchWeb as performSearch } from '../../services/webSearch';

export async function searchWeb(params: Record<string, unknown>): Promise<ToolResult> {
  try {
    const query = params.query as string;

    if (!query) {
      return {
        tool: 'searchWeb',
        success: false,
        data: null,
        error: 'Missing required parameter: query',
      };
    }

    const results = await performSearch(query);

    return {
      tool: 'searchWeb',
      success: true,
      data: results,
    };
  } catch (error) {
    return {
      tool: 'searchWeb',
      success: false,
      data: null,
      error: error instanceof Error ? error.message : 'Search failed',
    };
  }
}
