import { ToolResult } from '../../types/llm';
import * as noteRepo from '../../db/repositories/noteRepository';

export async function writeNote(params: Record<string, unknown>): Promise<ToolResult> {
  try {
    const content = params.content as string;
    const type = (params.type as string) ?? 'insight';

    if (!content) {
      return {
        tool: 'writeNote',
        success: false,
        data: null,
        error: 'Missing required parameter: content',
      };
    }

    const note = await noteRepo.createNote(content, type);

    return {
      tool: 'writeNote',
      success: true,
      data: { noteId: note.id },
    };
  } catch (error) {
    return {
      tool: 'writeNote',
      success: false,
      data: null,
      error: error instanceof Error ? error.message : 'Failed to write note',
    };
  }
}
