import { ProxyError } from "./errors.js";
import { hintFieldsSchema, type HintFields } from "./schemas.js";

export const MAX_IMAGE_BYTES = 1.5 * 1024 * 1024;
export const MAX_COMBINED_IMAGE_BYTES = 3.2 * 1024 * 1024;
export const allowedImageTypes = ["image/jpeg", "image/png", "image/webp"] as const;

export type ImageFieldName = "frontImage" | "ingredientsImage";

export interface ValidatedImage {
  field: ImageFieldName;
  file: File;
  mimeType: (typeof allowedImageTypes)[number];
  sizeBytes: number;
  bytes: Uint8Array;
}

export interface ValidatedAnalyzeRequest {
  images: ValidatedImage[];
  hints: HintFields;
  hasFrontImage: boolean;
  hasIngredientsImage: boolean;
  imageByteSizes: number[];
}

export async function validateAnalyzeRequest(request: Request, expectedToken: string | null): Promise<ValidatedAnalyzeRequest> {
  if (!expectedToken || request.headers.get("x-vanity-client-token") !== expectedToken) {
    throw new ProxyError("UNAUTHORIZED_CLIENT");
  }
  const contentType = request.headers.get("content-type") ?? "";
  if (!contentType.toLowerCase().includes("multipart/form-data")) {
    throw new ProxyError("INVALID_MULTIPART");
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    throw new ProxyError("INVALID_MULTIPART");
  }

  const fileEntries = Array.from(formData.entries()).filter(([, value]) => value instanceof File && value.size > 0);
  if (fileEntries.length > 2) {
    throw new ProxyError("TOO_MANY_IMAGES");
  }

  const frontFiles = collectFiles(formData, "frontImage");
  const ingredientsFiles = collectFiles(formData, "ingredientsImage");
  if (frontFiles.length > 1 || ingredientsFiles.length > 1) {
    throw new ProxyError("TOO_MANY_IMAGES");
  }
  if (frontFiles.length + ingredientsFiles.length === 0) {
    throw new ProxyError("IMAGE_REQUIRED");
  }

  const hintsParse = hintFieldsSchema.safeParse({
    brandHint: optionalText(formData.get("brandHint")),
    productNameHint: optionalText(formData.get("productNameHint")),
    categoryHint: optionalText(formData.get("categoryHint")),
    promptVersion: optionalText(formData.get("promptVersion"))
  });
  if (!hintsParse.success) {
    throw new ProxyError("INVALID_HINT");
  }

  const images: ValidatedImage[] = [];
  for (const file of frontFiles) {
    images.push(await readImage("frontImage", file));
  }
  for (const file of ingredientsFiles) {
    images.push(await readImage("ingredientsImage", file));
  }

  const totalBytes = images.reduce((sum, image) => sum + image.sizeBytes, 0);
  if (totalBytes > MAX_COMBINED_IMAGE_BYTES) {
    throw new ProxyError("PAYLOAD_TOO_LARGE");
  }
  if (images.some((image) => image.sizeBytes > MAX_IMAGE_BYTES)) {
    throw new ProxyError("IMAGE_TOO_LARGE");
  }

  return {
    images,
    hints: hintsParse.data,
    hasFrontImage: images.some((image) => image.field === "frontImage"),
    hasIngredientsImage: images.some((image) => image.field === "ingredientsImage"),
    imageByteSizes: images.map((image) => image.sizeBytes)
  };
}

function collectFiles(formData: FormData, field: ImageFieldName): File[] {
  return formData.getAll(field).filter((value): value is File => value instanceof File && value.size > 0);
}

function optionalText(value: FormDataEntryValue | null): string | undefined {
  if (typeof value !== "string") {
    return undefined;
  }
  const trimmed = value.trim();
  return trimmed ? trimmed : undefined;
}

async function readImage(field: ImageFieldName, file: File): Promise<ValidatedImage> {
  if (!allowedImageTypes.includes(file.type as (typeof allowedImageTypes)[number])) {
    throw new ProxyError("UNSUPPORTED_IMAGE_TYPE");
  }
  const bytes = new Uint8Array(await file.arrayBuffer());
  if (!matchesSignature(bytes, file.type)) {
    throw new ProxyError("UNSUPPORTED_IMAGE_TYPE");
  }
  return {
    field,
    file,
    mimeType: file.type as (typeof allowedImageTypes)[number],
    sizeBytes: file.size,
    bytes
  };
}

export function matchesSignature(bytes: Uint8Array, mimeType: string): boolean {
  if (mimeType === "image/jpeg") {
    return bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  }
  if (mimeType === "image/png") {
    return bytes.length >= 8 && bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47;
  }
  if (mimeType === "image/webp") {
    return (
      bytes.length >= 12 &&
      bytes[0] === 0x52 &&
      bytes[1] === 0x49 &&
      bytes[2] === 0x46 &&
      bytes[3] === 0x46 &&
      bytes[8] === 0x57 &&
      bytes[9] === 0x45 &&
      bytes[10] === 0x42 &&
      bytes[11] === 0x50
    );
  }
  return false;
}
