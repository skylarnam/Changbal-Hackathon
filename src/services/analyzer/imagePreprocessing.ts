import * as ImageManipulator from "expo-image-manipulator";
import type { PreparedAnalyzerImage } from "./ProductAnalyzer";

export const MAX_ANALYZER_IMAGE_BYTES = 1.5 * 1024 * 1024;
const TARGET_LONG_SIDE = 1700;
const MIN_LONG_SIDE = 1000;
const INITIAL_QUALITY = 0.8;

export async function prepareAnalyzerImage(uri: string, hint: "front" | "ingredients"): Promise<PreparedAnalyzerImage> {
  let currentUri = uri;
  let quality = INITIAL_QUALITY;
  let longSide: number | null = null;
  let lastWidth: number | null = null;
  let lastHeight: number | null = null;
  let latestBlob: Blob | null = null;

  for (let attempt = 0; attempt < 5; attempt += 1) {
    const actions = longSide && lastWidth && lastHeight ? [{ resize: resizeForLongSide(longSide, lastWidth, lastHeight) }] : [];
    const result = await ImageManipulator.manipulateAsync(currentUri, actions, {
      compress: quality,
      format: ImageManipulator.SaveFormat.JPEG
    });
    currentUri = result.uri;
    lastWidth = result.width;
    lastHeight = result.height;
    latestBlob = await fetchBlob(currentUri);
    if (latestBlob.size <= MAX_ANALYZER_IMAGE_BYTES) {
      return {
        uri: currentUri,
        name: `${hint}.jpg`,
        type: "image/jpeg",
        sizeBytes: latestBlob.size,
        blob: latestBlob
      };
    }
    const currentLongSide = Math.max(result.width, result.height);
    longSide = Math.min(TARGET_LONG_SIDE, Math.max(MIN_LONG_SIDE, Math.floor(currentLongSide * 0.85)));
    quality = Math.max(0.55, quality - 0.1);
  }

  throw new Error("이미지 용량을 분석 제한 이하로 줄이지 못했어요. 더 가까이, 밝게 촬영한 뒤 다시 시도해 주세요.");
}

function resizeForLongSide(longSide: number, width: number, height: number): { width: number } | { height: number } {
  return width >= height ? { width: longSide } : { height: longSide };
}

async function fetchBlob(uri: string): Promise<Blob> {
  const response = await fetch(uri);
  return response.blob();
}
