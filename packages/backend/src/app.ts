import express, { Express } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import { healthRouter } from './routes/health.js';
import { authRouter } from './routes/auth.js';
import { servicesRouter } from './routes/services.js';
import { reviewRequestsRouter } from './routes/reviewRequests.js';
import { publicRouter } from './routes/public.js';
import { draftsRouter } from './routes/drafts.js';
import { adminRouter } from './routes/admin.js';

dotenv.config({ path: '../../.env' });
dotenv.config();

export const app: Express = express();

const clientOrigin = process.env.FRONTEND_URL || 'http://localhost:5173';

// Security configurations
app.set('trust proxy', 1);

app.use(helmet({
  contentSecurityPolicy: false, // Allows cross-origin assets like Google fonts and review redirects
  crossOriginEmbedderPolicy: false
}));

app.use(cors({
  origin: clientOrigin,
  credentials: true
}));

app.use(express.json({ limit: '1mb' }));
app.use(cookieParser());

// Routes
app.use('/api/health', healthRouter);
app.use('/api/auth', authRouter);
app.use('/api/services', servicesRouter);
app.use('/api/review-requests', reviewRequestsRouter);
app.use('/api/public/review-requests', publicRouter);
app.use('/api/public/review-requests', draftsRouter);
app.use('/api/admin', adminRouter);
