export interface ModelInfo {
  id: string;
  name: string;
  fileName: string;
  size: string;
  sizeBytes: number;
  url: string;
  description: string;
  ramRequired: string;
}

export interface DownloadProgress {
  modelId: string;
  progress: number;
  totalBytes: number;
  downloadedBytes: number;
}

export type ModelStatus = 'not_downloaded' | 'downloading' | 'downloaded' | 'active' | 'error';

export interface ModelState {
  status: ModelStatus;
  progress: number;
  downloadedBytes?: number;
  localPath?: string;
  error?: string;
}
