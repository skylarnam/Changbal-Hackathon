import { readFile } from "node:fs/promises";
import { basename } from "node:path";

interface Args {
  url: string;
  front?: string;
  ingredients?: string;
}

const args = parseArgs(process.argv.slice(2));
const token = process.env.ANALYZER_CLIENT_TOKEN;

if (!token) {
  throw new Error("ANALYZER_CLIENT_TOKEN is required for smoke tests.");
}
if (!args.front && !args.ingredients) {
  throw new Error("Provide --front /absolute/path.jpg or --ingredients /absolute/path.jpg.");
}

const form = new FormData();
if (args.front) {
  form.append("frontImage", await fileFromPath(args.front), basename(args.front));
}
if (args.ingredients) {
  form.append("ingredientsImage", await fileFromPath(args.ingredients), basename(args.ingredients));
}

const response = await fetch(`${args.url.replace(/\/$/, "")}/api/analyze-product`, {
  method: "POST",
  headers: {
    "x-vanity-client-token": token
  },
  body: form
});

const json = (await response.json()) as unknown;
console.log(JSON.stringify({ status: response.status, body: json }, null, 2));

function parseArgs(raw: string[]): Args {
  const parsed: Args = { url: process.env.ANALYSIS_API_URL ?? "http://localhost:3000" };
  for (let index = 0; index < raw.length; index += 1) {
    const key = raw[index];
    const value = raw[index + 1];
    if (!value) {
      continue;
    }
    if (key === "--url") {
      parsed.url = value;
      index += 1;
    } else if (key === "--front") {
      parsed.front = value;
      index += 1;
    } else if (key === "--ingredients") {
      parsed.ingredients = value;
      index += 1;
    }
  }
  return parsed;
}

async function fileFromPath(path: string): Promise<File> {
  const bytes = await readFile(path);
  const mimeType = mimeFromName(path);
  return new File([bytes], basename(path), { type: mimeType });
}

function mimeFromName(path: string): string {
  if (/\.(png)$/i.test(path)) {
    return "image/png";
  }
  if (/\.(webp)$/i.test(path)) {
    return "image/webp";
  }
  return "image/jpeg";
}
