import fs from 'fs';
import path from 'path';

export async function GET(request, { params }) {
  const { slug } = params;
  if (!slug || !Array.isArray(slug) || slug.length === 0) {
    return new Response('Not found', { status: 404 });
  }

  const requestedFilename = slug.join('/');
  
  // Possible image search directories
  const candidateDirs = [
    path.join(process.cwd(), 'public', 'images'),
    path.join(process.cwd(), 'Public', 'images'),
    path.join(process.cwd(), 'frontend', 'public', 'images'),
    path.join(process.cwd(), 'frontend', 'Public', 'images'),
    path.join(process.cwd(), 'src', 'images'),
    path.join(process.cwd(), 'images'),
  ];

  let resolvedFile = null;

  for (const dir of candidateDirs) {
    if (!fs.existsSync(dir)) continue;

    // Direct match
    const directPath = path.join(dir, requestedFilename);
    if (fs.existsSync(directPath) && fs.statSync(directPath).isFile()) {
      resolvedFile = directPath;
      break;
    }

    // Case-insensitive match in directory
    try {
      const files = fs.readdirSync(dir);
      const match = files.find(f => f.toLowerCase() === requestedFilename.toLowerCase());
      if (match) {
        resolvedFile = path.join(dir, match);
        break;
      }
    } catch (e) {
      // Ignore read errors
    }
  }

  if (!resolvedFile) {
    return new Response(`Image not found: ${requestedFilename}`, { status: 404 });
  }

  try {
    const fileBuffer = fs.readFileSync(resolvedFile);
    const ext = path.extname(resolvedFile).toLowerCase();

    let contentType = 'application/octet-stream';
    if (ext === '.jpg' || ext === '.jpeg') contentType = 'image/jpeg';
    else if (ext === '.png') contentType = 'image/png';
    else if (ext === '.webp') contentType = 'image/webp';
    else if (ext === '.svg') contentType = 'image/svg+xml';
    else if (ext === '.ico') contentType = 'image/x-icon';

    return new Response(fileBuffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch (err) {
    return new Response('Error loading image', { status: 500 });
  }
}
