import "server-only";

import { randomBytes } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

// Arquivos públicos (imagens de posts, campanhas) ficam em public/uploads e são
// servidos estaticamente pelo Next. Diferente dos arquivos privados, não
// passam por rota com autorização.
const PUBLIC_UPLOADS_ROOT = path.join(process.cwd(), "public", "uploads");

const extensionByMime: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
};

export const allowedImageMimeTypes = Object.keys(extensionByMime);
export const maxImageSizeBytes = 5 * 1024 * 1024;

// Salva a imagem e devolve o caminho público (ex.: /uploads/org-posts/ab12.jpg).
export async function savePublicImage(folder: string, file: File) {
  const extension = extensionByMime[file.type];
  if (!extension) {
    throw new Error(`Tipo de imagem não permitido: ${file.type}`);
  }

  const storedName = `${randomBytes(16).toString("hex")}${extension}`;
  const directory = path.join(PUBLIC_UPLOADS_ROOT, folder);
  await mkdir(directory, { recursive: true });

  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(path.join(directory, storedName), buffer);

  return `/uploads/${folder}/${storedName}`;
}
