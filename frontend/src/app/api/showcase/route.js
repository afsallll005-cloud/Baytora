import fs from 'fs';
import path from 'path';

export async function GET() {
  const sourcePath = 'C:\\Users\\hp\\.gemini\\antigravity-ide\\brain\\e6c3491b-e5d7-4440-bef1-18e504f0bf2f\\.user_uploaded\\media_1792228877116.png';
  const destDir = path.join(process.cwd(), 'public', 'images');
  const destPath = path.join(destDir, 'showcase-villa.png');

  try {
    if (fs.existsSync(destPath)) {
      const buffer = fs.readFileSync(destPath);
      return new Response(buffer, {
        headers: {
          'Content-Type': 'image/png',
          'Cache-Control': 'public, max-age=86400',
        },
      });
    }

    if (fs.existsSync(sourcePath)) {
      if (!fs.existsSync(destDir)) {
        fs.mkdirSync(destDir, { recursive: true });
      }
      fs.copyFileSync(sourcePath, destPath);
      const buffer = fs.readFileSync(destPath);
      return new Response(buffer, {
        headers: {
          'Content-Type': 'image/png',
          'Cache-Control': 'public, max-age=86400',
        },
      });
    }
  } catch (err) {
    console.error('Error copying/serving showcase image:', err);
  }

  // Fallback high-res luxury architectural pool villa
  return Response.redirect('https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=2400&q=85');
}
