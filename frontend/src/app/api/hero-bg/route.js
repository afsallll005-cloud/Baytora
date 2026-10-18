import fs from 'fs';
import path from 'path';

export async function GET() {
  const sourcePath = 'C:\\Users\\hp\\.gemini\\antigravity-ide\\brain\\da180246-f160-4723-bbf4-21a60a0f10fd\\luxterra_hero_bg_1792302723551.jpg';
  const destDir = path.join(process.cwd(), 'public', 'images');
  const destPath = path.join(destDir, 'luxterra-hero.jpg');

  try {
    if (fs.existsSync(destPath)) {
      const buffer = fs.readFileSync(destPath);
      return new Response(buffer, {
        headers: {
          'Content-Type': 'image/jpeg',
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
          'Content-Type': 'image/jpeg',
          'Cache-Control': 'public, max-age=86400',
        },
      });
    }
  } catch (err) {
    console.error('Error copying/serving hero background:', err);
  }

  // High-res luxury penthouse infinity pool twilight fallback
  return Response.redirect('https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=2400&q=85');
}
