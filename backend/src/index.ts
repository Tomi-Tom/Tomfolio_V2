import 'dotenv/config';
import 'express-async-errors';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { errorHandler } from './utils/errors.js';
import authRoutes from './routes/auth.js';
import contactRoutes from './routes/contact.js';
import projectRoutes from './routes/projects.js';
import skillRoutes from './routes/skills.js';
import serviceRoutes from './routes/services.js';
import testimonialRoutes from './routes/testimonials.js';
import tagRoutes from './routes/tags.js';
import userRoutes from './routes/users.js';
import statsRoutes from './routes/stats.js';
import { authLimiter } from './middleware/rateLimiter.js';
import prisma from './lib/prisma.js';

const app = express();
const PORT = process.env.PORT || 4000;

app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser());

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/skills', skillRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/testimonials', testimonialRoutes);
app.use('/api/tags', tagRoutes);
app.use('/api/users', userRoutes);
app.use('/api/stats', statsRoutes);

// Cleanup old page views every 24 hours
setInterval(async () => {
  try {
    const cutoff = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
    const { count } = await prisma.pageView.deleteMany({ where: { createdAt: { lt: cutoff } } });
    if (count > 0) console.log(`Cleaned up ${count} old page views`);
  } catch (err) {
    console.error('PageView cleanup error:', err);
  }
}, 86_400_000);

// Error handler must be the last middleware
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});
