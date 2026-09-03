import cors from 'cors';
import express, { NextFunction, Request, Response } from 'express';
import { hydrate } from './store';
import { sessionRouter } from './routes/session';
import { onboardingRouter } from './routes/onboarding';
import { servicesRouter } from './routes/services';
import { ordersRouter } from './routes/orders';
import { homeRouter } from './routes/home';
import { profileRouter } from './routes/profile';
import { jobsRouter } from './routes/jobs';
import { deliveryRouter } from './routes/delivery';
import { chatRouter } from './routes/chat';

export const app = express();
app.use(cors());
app.use(express.json());

app.get('/api/v1/health', (_req, res) => res.json({ ok: true }));

// Every request re-reads app state from Netlify DB first — see store.ts for why.
app.use((_req, _res, next: NextFunction) => {
  hydrate().then(() => next()).catch(next);
});

const v1 = express.Router();
v1.use(sessionRouter);
v1.use(onboardingRouter);
v1.use(servicesRouter);
v1.use(ordersRouter);
v1.use(homeRouter);
v1.use(profileRouter);
v1.use(jobsRouter);
v1.use(deliveryRouter);
v1.use(chatRouter);
app.use('/api/v1', v1);

app.use((_req, res) => res.status(404).json({ error: 'not found' }));

// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  // eslint-disable-next-line no-console
  console.error(err);
  res.status(500).json({ error: 'internal error' });
});
