import { Router, Request, Response } from 'express';

const router = Router();

// GET /api/map/tile/:z/:x/:y — Proxy VietMap tiles to hide API key
router.get('/tile/:z/:x/:y', async (req: Request, res: Response) => {
  const { z, x, y } = req.params;
  const apiKey = process.env.VIETMAP_API_KEY;

  if (!apiKey) {
    res.status(500).json({ error: 'VietMap API key not configured' });
    return;
  }

  try {
    const tileUrl = `https://maps.vietmap.vn/api/tm/${z}/${x}/${y}@2x.png?apikey=${apiKey}`;
    const response = await fetch(tileUrl);

    if (!response.ok) {
      // Fallback to OpenStreetMap if VietMap fails
      const osmUrl = `https://tile.openstreetmap.org/${z}/${x}/${y}.png`;
      const osmResponse = await fetch(osmUrl);
      const osmBuffer = Buffer.from(await osmResponse.arrayBuffer());
      res.set('Content-Type', 'image/png');
      res.set('Cache-Control', 'public, max-age=86400');
      res.send(osmBuffer);
      return;
    }

    const buffer = Buffer.from(await response.arrayBuffer());
    res.set('Content-Type', 'image/png');
    res.set('Cache-Control', 'public, max-age=86400');
    res.send(buffer);
  } catch {
    res.status(500).json({ error: 'Failed to fetch tile' });
  }
});

// GET /api/map/config — Return tile URL template for the client
router.get('/config', (_req: Request, res: Response) => {
  const apiKey = process.env.VIETMAP_API_KEY;
  const hasVietMap = !!apiKey;

  res.json({
    tileUrl: hasVietMap
      ? '/api/map/tile/{z}/{x}/{y}'
      : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: hasVietMap
      ? '&copy; <a href="https://vietmap.vn">VietMap</a>'
      : '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    maxZoom: 20,
    useProxy: hasVietMap,
  });
});

export default router;
