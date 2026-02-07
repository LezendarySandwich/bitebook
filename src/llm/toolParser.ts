import { ToolCall } from '../types/llm';

const TOOL_CALL_REGEX = /<tool_call>\s*(\{[\s\S]*?\})\s*<\/tool_call>/g;

export function parseToolCalls(text: string): ToolCall[] {
  const toolCalls: ToolCall[] = [];
  let match: RegExpExecArray | null;

  // Reset regex state
  TOOL_CALL_REGEX.lastIndex = 0;

  while ((match = TOOL_CALL_REGEX.exec(text)) !== null) {
    try {
      let jsonStr = match[1].trim();

      // Fix common JSON issues from small models
      jsonStr = jsonStr
        .replace(/'/g, '"') // single quotes to double
        .replace(/,\s*}/g, '}') // trailing commas
        .replace(/,\s*]/g, ']'); // trailing commas in arrays

      const parsed = JSON.parse(jsonStr);

      if (parsed.tool && typeof parsed.tool === 'string') {
        toolCalls.push({
          tool: parsed.tool,
          params: parsed.params ?? {},
        });
      }
    } catch {
      // Skip malformed tool calls
      continue;
    }
  }

  return toolCalls;
}

export function stripToolCalls(text: string): string {
  return text.replace(/<tool_call>[\s\S]*?<\/tool_call>/g, '').trim();
}

export function hasToolCalls(text: string): boolean {
  TOOL_CALL_REGEX.lastIndex = 0;
  return TOOL_CALL_REGEX.test(text);
}
