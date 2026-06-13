import "server-only";

import { randomBytes } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

// Arquivos privados ficam fora de public/ e só são servidos por rotas que
// verificam autorização (requisito: "private files must not be served from
// public paths").
const PRIVATE_ROOT = path.join(process.cwd(), "storage", "private");

const extensionByMime: Record<string, string> = {
  "application/pdf": ".pdf",
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
};

export const allowedDocumentMimeTypes = Object.keys(extensionByMime);
export const maxDocumentSizeBytes = 10 * 1024 * 1024;

export async function savePrivateFile(folder: string, file: File) {
  const extension = extensionByMime[file.type];
  if (!extension) {
    throw new Error(`Tipo de arquivo não permitido: ${file.type}`);
  }

  const storedName = `${randomBytes(16).toString("hex")}${extension}`;
  const directory = path.join(PRIVATE_ROOT, folder);
  await mkdir(directory, { recursive: true });

  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(path.join(directory, storedName), buffer);

  return storedName;
}

export async function readPrivateFile(folder: string, storedName: string) {
  // path.basename impede path traversal via nomes vindos do banco/URL.
  const safeName = path.basename(storedName);
  return readFile(path.join(PRIVATE_ROOT, folder, safeName));
}
