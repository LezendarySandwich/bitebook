import { llmService } from './LLMService';
import { buildSystemPrompt, TOOL_DEFINITIONS } from './systemPrompt';
import { executeToolCall } from './toolExecutor';
import { parseToolCalls, stripToolCalls } from './toolParser';
import { useChatStore } from '../stores/useChatStore';
import { useSettingsStore } from '../stores/useSettingsStore';
import { useModelStore } from '../stores/useModelStore';
import { ToolCall } from '../types/llm';
import * as messageRepo from '../db/repositories/messageRepository';

const MAX_ITERATIONS = 5;
const MAX_CONTEXT_MESSAGES = 20;

interface ChatMessage {
  role: 'system' | 'user' | 'assistant' | 'tool';
  content: string;
  tool_call_id?: string;
}

let toolCallCounter = 0;

class ChatManager {
  async handleUserMessage(
    userMessage: string,
    conversationId: number
  ): Promise<void> {
    const chatStore = useChatStore.getState();
    const { calorieTarget } = useSettingsStore.getState();
    const { activeModelId } = useModelStore.getState();

    chatStore.setIsProcessing(true);
    chatStore.clearToolCalls(); // Clear any leftover in-flight items

    // Ensure model is loaded
    if (!llmService.isLoaded()) {
      if (!activeModelId) {
        await chatStore.addAssistantMessage(
          'No model is loaded. Please go to Settings and download/activate a model first.'
        );
        chatStore.setIsProcessing(false);
        return;
      }
      try {
        await llmService.init(activeModelId);
      } catch {
        await chatStore.addAssistantMessage(
          'Failed to load the model. Please check Settings and try again.'
        );
        chatStore.setIsProcessing(false);
        return;
      }
    }

    // Build conversation context from DB
    const recentMessages = await messageRepo.getRecentMessages(
      conversationId,
      MAX_CONTEXT_MESSAGES
    );

    const systemPrompt = buildSystemPrompt(calorieTarget);
    const messages: ChatMessage[] = [
      { role: 'system', content: systemPrompt },
      ...recentMessages
        .filter((m) => m.role !== 'tool_call')
        .map((m) => ({
          role: m.role as 'user' | 'assistant',
          content: m.content,
        })),
    ];

    // Iterative tool-calling loop
    let iteration = 0;
    while (iteration < MAX_ITERATIONS) {
      iteration++;

      // Stream LLM response
      chatStore.setIsStreaming(true);
      chatStore.setStreamingText('');

      let fullText = '';
      let result;
      try {
        result = await llmService.completion(messages, {
          tools: TOOL_DEFINITIONS,
          onToken: (token) => {
            fullText += token;
            // Strip any <tool_call>...</tool_call> content from visible streaming text
            const visibleText = stripToolCalls(fullText);
            useChatStore.getState().setStreamingText(visibleText);
          },
        });
      } catch (error) {
        chatStore.setIsStreaming(false);
        chatStore.setIsProcessing(false);
        await chatStore.addAssistantMessage(
          'Sorry, I encountered an error generating a response. Please try again.'
        );
        return;
      }

      chatStore.setIsStreaming(false);

      // Check for native tool calls first
      if (result.tool_calls && result.tool_calls.length > 0) {
        // Add the assistant message with tool calls to context (not to UI)
        messages.push({ role: 'assistant', content: result.text || '' });

        // Persist any accompanying text as a visible message before tool execution
        const preToolText = stripToolCalls(result.text).trim();
        if (preToolText) {
          await useChatStore.getState().addAssistantMessage(preToolText);
        }

        for (const nativeToolCall of result.tool_calls) {
          const toolName = nativeToolCall.function.name;
          let toolParams: Record<string, unknown> = {};
          try {
            toolParams = JSON.parse(nativeToolCall.function.arguments);
          } catch {
            // empty params
          }

          const tcId = `tc_${++toolCallCounter}`;

          // Show tool call in UI as "running"
          useChatStore.getState().addToolCall({
            id: tcId,
            toolName,
            params: toolParams,
            status: 'running',
          });

          const toolCall: ToolCall = { tool: toolName, params: toolParams };
          const toolResult = await executeToolCall(toolCall);

          const completedStatus = toolResult.success ? 'done' : 'error';

          // Persist completed tool call to DB and remove from in-memory
          await useChatStore.getState().addToolCallMessage({
            id: tcId,
            toolName,
            params: toolParams,
            status: completedStatus as 'done' | 'error',
            result: toolResult.data,
            error: toolResult.error,
          });
          useChatStore.getState().removeToolCall(tcId);

          // Add tool result to message context for next LLM turn
          messages.push({
            role: 'tool',
            content: JSON.stringify(toolResult.data ?? { error: toolResult.error }),
            tool_call_id: nativeToolCall.id ?? toolName,
          });
        }

        // Continue loop — LLM will see tool results and respond
        continue;
      }

      // Fallback: parse tool calls from text for models without native function calling
      const textToolCalls = parseToolCalls(result.text);
      if (textToolCalls.length > 0) {
        // Add the assistant text (with tool calls) to context
        messages.push({ role: 'assistant', content: result.text || '' });

        // Persist any accompanying text as a visible message before tool execution
        const preToolText = stripToolCalls(result.text).trim();
        if (preToolText) {
          await useChatStore.getState().addAssistantMessage(preToolText);
        }

        for (const parsedToolCall of textToolCalls) {
          const tcId = `tc_${++toolCallCounter}`;

          useChatStore.getState().addToolCall({
            id: tcId,
            toolName: parsedToolCall.tool,
            params: parsedToolCall.params,
            status: 'running',
          });

          const toolResult = await executeToolCall(parsedToolCall);

          const completedStatus = toolResult.success ? 'done' : 'error';

          // Persist completed tool call to DB and remove from in-memory
          await useChatStore.getState().addToolCallMessage({
            id: tcId,
            toolName: parsedToolCall.tool,
            params: parsedToolCall.params,
            status: completedStatus as 'done' | 'error',
            result: toolResult.data,
            error: toolResult.error,
          });
          useChatStore.getState().removeToolCall(tcId);

          messages.push({
            role: 'tool',
            content: JSON.stringify(toolResult.data ?? { error: toolResult.error }),
            tool_call_id: parsedToolCall.tool,
          });
        }

        // Continue loop — LLM will see tool results and respond
        continue;
      }

      // No tool calls — this is the final response
      const responseText = stripToolCalls(result.text).trim();
      if (responseText) {
        await useChatStore.getState().addAssistantMessage(responseText);
      }

      // Tool calls stay visible until the next user message (cleared at start of handleUserMessage)
      break;
    }

    useChatStore.getState().setIsProcessing(false);
  }
}

export const chatManager = new ChatManager();
