import * as FileSystem from 'expo-file-system';
import { ModelInfo } from '../types/models';

const MODELS_DIR = `${FileSystem.documentDirectory}models/`;

export function getModelPath(fileName: string): string {
  return `${MODELS_DIR}${fileName}`;
}

async function ensureModelsDir(): Promise<void> {
  const dirInfo = await FileSystem.getInfoAsync(MODELS_DIR);
  if (!dirInfo.exists) {
    await FileSystem.makeDirectoryAsync(MODELS_DIR, { intermediates: true });
  }
}

export interface DownloadProgressInfo {
  progress: number;
  downloadedBytes: number;
}

export async function downloadModel(
  model: ModelInfo,
  onProgress: (info: DownloadProgressInfo) => void
): Promise<string> {
  await ensureModelsDir();

  const destPath = getModelPath(model.fileName);

  const downloadResumable = FileSystem.createDownloadResumable(
    model.url,
    destPath,
    {
      headers: {
        'User-Agent': 'BiteBook/1.0',
      },
    },
    (downloadProgress) => {
      const bytesWritten = downloadProgress.totalBytesWritten;
      const bytesExpected = downloadProgress.totalBytesExpectedToWrite;

      let progress: number;
      if (bytesExpected > 0) {
        progress = (bytesWritten / bytesExpected) * 100;
      } else {
        progress = (bytesWritten / model.sizeBytes) * 100;
      }

      onProgress({
        progress: Math.min(progress, 99),
        downloadedBytes: bytesWritten,
      });
    }
  );

  const result = await downloadResumable.downloadAsync();
  if (!result?.uri) {
    throw new Error('Download failed');
  }

  // Verify the downloaded file is actually a GGUF and not an error page
  const fileInfo = await FileSystem.getInfoAsync(result.uri);
  if (fileInfo.exists && 'size' in fileInfo && fileInfo.size < 1_000_000) {
    // File is suspiciously small (< 1MB) — likely an error page
    await FileSystem.deleteAsync(result.uri, { idempotent: true });
    throw new Error('Download returned an invalid file. The model may require authentication on HuggingFace.');
  }

  return result.uri;
}

export async function deleteModelFile(fileName: string): Promise<void> {
  const path = getModelPath(fileName);
  const fileInfo = await FileSystem.getInfoAsync(path);
  if (fileInfo.exists) {
    await FileSystem.deleteAsync(path, { idempotent: true });
  }
}

export async function getDownloadedModels(): Promise<string[]> {
  await ensureModelsDir();
  const files = await FileSystem.readDirectoryAsync(MODELS_DIR);
  return files.filter((f) => f.endsWith('.gguf'));
}
