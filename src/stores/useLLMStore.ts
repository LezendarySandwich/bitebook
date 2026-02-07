import { create } from 'zustand';

interface LLMState {
  isModelLoaded: boolean;
  isLoadingModel: boolean;
  loadError: string | null;

  setModelLoaded: (loaded: boolean) => void;
  setLoadingModel: (loading: boolean) => void;
  setLoadError: (error: string | null) => void;
}

export const useLLMStore = create<LLMState>((set) => ({
  isModelLoaded: false,
  isLoadingModel: false,
  loadError: null,

  setModelLoaded: (loaded: boolean) =>
    set({ isModelLoaded: loaded, loadError: null }),
  setLoadingModel: (loading: boolean) => set({ isLoadingModel: loading }),
  setLoadError: (error: string | null) =>
    set({ loadError: error, isLoadingModel: false, isModelLoaded: false }),
}));
