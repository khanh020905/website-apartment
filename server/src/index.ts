import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth';
import mapRoutes from './routes/map';
import buildingRoutes from './routes/buildings';
import roomRoutes from './routes/rooms';
import listingRoutes from './routes/listings';
import searchRoutes from './routes/search';
import adminRoutes from './routes/admin';
import qrRoutes from './routes/qr';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:5173'],
  credentials: true,
}));
app.use(express.json({ limit: '10mb' })); // Increased for image data
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/map', mapRoutes);
app.use('/api/buildings', buildingRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/listings', listingRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/qr', qrRoutes);

// Health check route
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    message: 'Server is running',
    timestamp: new Date().toISOString(),
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});

export default app;
