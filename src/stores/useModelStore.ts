import { create } from 'zustand';
import { ModelInfo, ModelState } from '../types/models';
import * as settingsRepo from '../db/repositories/settingsRepository';
import { downloadModel, deleteModelFile, getModelPath } from '../services/modelDownloader';
import * as FileSystem from 'expo-file-system';

export const MODEL_CATALOG: ModelInfo[] = [
  {
    id: 'smollm2-360m',
    name: 'SmolLM2 360M',
    fileName: 'SmolLM2-360M-Instruct-Q8_0.gguf',
    size: '369 MB',
    sizeBytes: 369_000_000,
    url: 'https://huggingface.co/bartowski/SmolLM2-360M-Instruct-GGUF/resolve/main/SmolLM2-360M-Instruct-Q8_0.gguf?download=true',
    description: 'Tiny model for testing. Fast download, limited quality.',
    ramRequired: '1 GB',
  },
  {
    id: 'qwen2.5-1.5b',
    name: 'Qwen 2.5 1.5B',
    fileName: 'Qwen2.5-1.5B-Instruct-Q4_K_M.gguf',
    size: '940 MB',
    sizeBytes: 940_000_000,
    url: 'https://huggingface.co/bartowski/Qwen2.5-1.5B-Instruct-GGUF/resolve/main/Qwen2.5-1.5B-Instruct-Q4_K_M.gguf?download=true',
    description: 'Strong instruction following. Best quality for size.',
    ramRequired: '2 GB',
  },
  {
    id: 'phi-3-mini',
    name: 'Phi-3 Mini 3.8B',
    fileName: 'Phi-3-mini-4k-instruct-Q4_K_M.gguf',
    size: '2.2 GB',
    sizeBytes: 2_200_000_000,
    url: 'https://huggingface.co/bartowski/Phi-3-mini-4k-instruct-GGUF/resolve/main/Phi-3-mini-4k-instruct-Q4_K_M.gguf?download=true',
    description: 'Microsoft model. Best quality, larger download.',
    ramRequired: '4 GB',
  },
];

interface ModelStoreState {
  modelStates: Record<string, ModelState>;
  activeModelId: string;
  isLoading: boolean;

  loadModelStates: () => Promise<void>;
  startDownload: (modelId: string) => Promise<void>;
  cancelDownload: (modelId: string) => void;
  deleteModel: (modelId: string) => Promise<void>;
  activateModel: (modelId: string) => Promise<void>;
}

export const useModelStore = create<ModelStoreState>((set, get) => ({
  modelStates: {},
  activeModelId: '',
  isLoading: true,

  loadModelStates: async () => {
    const activeModel = await settingsRepo.getActiveModel();
    const states: Record<string, ModelState> = {};

    for (const model of MODEL_CATALOG) {
      const path = getModelPath(model.fileName);
      const fileInfo = await FileSystem.getInfoAsync(path);
      if (fileInfo.exists) {
        states[model.id] = {
          status: model.id === activeModel ? 'active' : 'downloaded',
          progress: 100,
          localPath: path,
        };
      } else {
        states[model.id] = { status: 'not_downloaded', progress: 0 };
      }
    }

    set({ modelStates: states, activeModelId: activeModel, isLoading: false });
  },

  startDownload: async (modelId: string) => {
    const model = MODEL_CATALOG.find((m) => m.id === modelId);
    if (!model) return;

    set((state) => ({
      modelStates: {
        ...state.modelStates,
        [modelId]: { status: 'downloading', progress: 0 },
      },
    }));

    try {
      await downloadModel(model, (info) => {
        set((state) => ({
          modelStates: {
            ...state.modelStates,
            [modelId]: {
              status: 'downloading',
              progress: info.progress,
              downloadedBytes: info.downloadedBytes,
            },
          },
        }));
      });

      const path = getModelPath(model.fileName);
      set((state) => ({
        modelStates: {
          ...state.modelStates,
          [modelId]: { status: 'downloaded', progress: 100, localPath: path },
        },
      }));
    } catch (error) {
      set((state) => ({
        modelStates: {
          ...state.modelStates,
          [modelId]: {
            status: 'error',
            progress: 0,
            error: error instanceof Error ? error.message : 'Download failed',
          },
        },
      }));
    }
  },

  cancelDownload: (_modelId: string) => {
    // TODO: implement download cancellation via resumable reference
  },

  deleteModel: async (modelId: string) => {
    const model = MODEL_CATALOG.find((m) => m.id === modelId);
    if (!model) return;

    await deleteModelFile(model.fileName);

    const { activeModelId } = get();
    if (activeModelId === modelId) {
      await settingsRepo.setActiveModel('');
      set({ activeModelId: '' });
    }

    set((state) => ({
      modelStates: {
        ...state.modelStates,
        [modelId]: { status: 'not_downloaded', progress: 0 },
      },
    }));
  },

  activateModel: async (modelId: string) => {
    const { modelStates, activeModelId } = get();
    const modelState = modelStates[modelId];
    if (!modelState || modelState.status === 'not_downloaded') return;

    await settingsRepo.setActiveModel(modelId);

    const updatedStates = { ...modelStates };
    if (activeModelId && updatedStates[activeModelId]) {
      updatedStates[activeModelId] = {
        ...updatedStates[activeModelId],
        status: 'downloaded',
      };
    }
    updatedStates[modelId] = { ...updatedStates[modelId], status: 'active' };

    set({ modelStates: updatedStates, activeModelId: modelId });
  },
}));
