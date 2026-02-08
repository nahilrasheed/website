import type { APIRoute, GetStaticPaths } from 'astro';
import fs from 'node:fs';
import path from 'node:path';

const ATTACHMENTS_DIR = path.join(process.cwd(), 'src/content/vault/attachments');

function getMimeType(filename: string): string {
  const ext = path.extname(filename).toLowerCase();
  switch (ext) {
    case '.jpg':
    case '.jpeg':
      return 'image/jpeg';
    case '.png':
      return 'image/png';
    case '.gif':
      return 'image/gif';
    case '.webp':
      return 'image/webp';
    case '.svg':
      return 'image/svg+xml';
    default:
      return 'application/octet-stream';
  }
}

export const getStaticPaths: GetStaticPaths = async () => {
  if (!fs.existsSync(ATTACHMENTS_DIR)) {
    return [];
  }

  const files = fs.readdirSync(ATTACHMENTS_DIR).filter(file => {
    return /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(file);
  });

  return files.map(file => ({
    params: { path: file },
  }));
};

export const GET: APIRoute = async ({ params }) => {
  const filePath = path.join(ATTACHMENTS_DIR, params.path!);

  if (!fs.existsSync(filePath)) {
    return new Response('Not Found', { status: 404 });
  }

  const fileBuffer = fs.readFileSync(filePath);
  const mimeType = getMimeType(filePath);
  const body = new Uint8Array(fileBuffer);

  return new Response(body, {
    headers: {
      'Content-Type': mimeType,
    },
  });
};
