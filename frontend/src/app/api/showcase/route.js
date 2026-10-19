import fs from 'fs';
import path from 'path';

export async function GET() {
  const candidatePaths = [
    path.join(process.cwd(), 'public', 'images', 'villa2.png'),
    path.join(process.cwd(), 'Public', 'images', 'villa2.png'),
    path.join(process.cwd(), 'frontend', 'public', 'images', 'villa2.png'),
    path.join(process.cwd(), 'frontend', 'Public', 'images', 'villa2.png'),
  ];

  for (const p of candidatePaths) {
    if (fs.existsSync(p)) {
      try {
        const buffer = fs.readFileSync(p);
        return new Response(buffer, {
          status: 200,
          headers: {
            'Content-Type': 'image/png',
            'Cache-Control': 'public, max-age=86400, stale-while-revalidate=43200',
          },
        });
      } catch (err) {
        console.error('Error reading villa2.png:', err);
      }
    }
  }

  return new Response('Villa showcase image not found', { status: 404 });
}
