import { initLlama, type LlamaContext } from 'llama.rn';
import { getModelPath } from '../services/modelDownloader';
import { MODEL_CATALOG } from '../stores/useModelStore';
import { useLLMStore } from '../stores/useLLMStore';

interface CompletionMessage {
  role: 'system' | 'user' | 'assistant' | 'tool';
  content: string;
  tool_call_id?: string;
}

interface ToolDefinition {
  type: 'function';
  function: {
    name: string;
    description: string;
    parameters: Record<string, unknown>;
  };
}

interface NativeToolCall {
  id?: string;
  function: {
    name: string;
    arguments: string;
  };
}

export interface CompletionResult {
  text: string;
  tool_calls?: NativeToolCall[];
}

const STOP_WORDS = [
  '</s>', '<|end|>', '<|eot_id|>', '<|end_of_text|>',
  '<|im_end|>', '<|EOT|>', '<|END_OF_TURN_TOKEN|>',
  '<|end_of_turn|>', '<|endoftext|>',
];

class LLMService {
  private context: LlamaContext | null = null;
  private currentModelId: string | null = null;

  async init(modelId: string): Promise<void> {
    const store = useLLMStore.getState();

    if (this.currentModelId === modelId && this.context) {
      store.setModelLoaded(true);
      return;
    }

    await this.release();

    store.setLoadingModel(true);

    try {
      const model = MODEL_CATALOG.find((m) => m.id === modelId);
      if (!model) throw new Error(`Model ${modelId} not found`);

      const modelPath = getModelPath(model.fileName);

      this.context = await initLlama({
        model: modelPath,
        n_ctx: 4096,
        n_batch: 512,
        n_threads: 4,
        n_gpu_layers: 99,
        use_mlock: true,
      });

      this.currentModelId = modelId;
      store.setModelLoaded(true);
    } catch (error) {
      store.setLoadError(
        error instanceof Error ? error.message : 'Failed to load model'
      );
      throw error;
    }
  }

  async completion(
    messages: CompletionMessage[],
    options?: {
      tools?: ToolDefinition[];
      onToken?: (token: string) => void;
    }
  ): Promise<CompletionResult> {
    if (!this.context) {
      throw new Error('Model not loaded. Call init() first.');
    }

    const params: Record<string, unknown> = {
      messages,
      n_predict: 1024,
      temperature: 0.7,
      top_p: 0.9,
      top_k: 40,
      stop: STOP_WORDS,
    };

    if (options?.tools && options.tools.length > 0) {
      params.tool_choice = 'auto';
      params.tools = options.tools;
    }

    const result = await this.context.completion(
      params as any,
      (data: any) => {
        if (data.token && options?.onToken) {
          options.onToken(data.token);
        }
      }
    );

    return {
      text: result.text ?? '',
      tool_calls: result.tool_calls as NativeToolCall[] | undefined,
    };
  }

  async release(): Promise<void> {
    if (this.context) {
      await this.context.release();
      this.context = null;
      this.currentModelId = null;
      useLLMStore.getState().setModelLoaded(false);
    }
  }

  isLoaded(): boolean {
    return this.context !== null;
  }

  getCurrentModelId(): string | null {
    return this.currentModelId;
  }
}

export const llmService = new LLMService();
