import { llmService } from './LLMService';
import { buildSystemPrompt, TOOL_DEFINITIONS } from './systemPrompt';
import { executeToolCall } from './toolExecutor';
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
    chatStore.clearToolCalls();

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
      ...recentMessages.map((m) => ({
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

      let result;
      try {
        result = await llmService.completion(messages, {
          tools: TOOL_DEFINITIONS,
          onToken: (token) => {
            const currentText = useChatStore.getState().streamingText;
            useChatStore.getState().setStreamingText(currentText + token);
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

      // Check for native tool calls
      if (result.tool_calls && result.tool_calls.length > 0) {
        // Add the assistant message with tool calls to context (not to UI)
        messages.push({ role: 'assistant', content: result.text || '' });

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

          // Update tool call in UI with result
          useChatStore.getState().updateToolCall(tcId, {
            status: toolResult.success ? 'done' : 'error',
            result: toolResult.data,
            error: toolResult.error,
          });

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

      // No tool calls — this is the final response
      const responseText = result.text.trim();
      if (responseText) {
        await useChatStore.getState().addAssistantMessage(responseText);
      }

      // Clear tool calls after final response is added
      useChatStore.getState().clearToolCalls();
      break;
    }

    useChatStore.getState().setIsProcessing(false);
  }
}

export const chatManager = new ChatManager();
