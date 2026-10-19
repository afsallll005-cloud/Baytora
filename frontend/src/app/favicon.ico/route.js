import fs from 'fs';
import path from 'path';

export async function GET() {
  const candidateDirs = [
    path.join(process.cwd(), 'public', 'images'),
    path.join(process.cwd(), 'Public', 'images'),
    path.join(process.cwd(), 'frontend', 'public', 'images'),
    path.join(process.cwd(), 'frontend', 'Public', 'images'),
  ];

  for (const dir of candidateDirs) {
    const logoPath = path.join(dir, 'Logo.png');
    if (fs.existsSync(logoPath)) {
      try {
        const buffer = fs.readFileSync(logoPath);

        // Also ensure icon files exist in static / public locations
        try {
          const publicDir = path.dirname(dir);
          const destFavicon = path.join(publicDir, 'favicon.ico');
          const destIcon = path.join(publicDir, 'icon.png');
          const appIcon = path.join(process.cwd(), 'src', 'app', 'icon.png');

          if (!fs.existsSync(destFavicon)) fs.writeFileSync(destFavicon, buffer);
          if (!fs.existsSync(destIcon)) fs.writeFileSync(destIcon, buffer);
          if (fs.existsSync(path.dirname(appIcon)) && !fs.existsSync(appIcon)) {
            fs.writeFileSync(appIcon, buffer);
          }
        } catch (copyErr) {
          // Non-blocking sync error
        }

        return new Response(buffer, {
          status: 200,
          headers: {
            'Content-Type': 'image/png',
            'Cache-Control': 'public, max-age=86400, stale-while-revalidate=43200',
          },
        });
      } catch (err) {
        console.error('Error reading Logo.png for favicon:', err);
      }
    }
  }

  return new Response('Favicon not found', { status: 404 });
}
