import cors from 'cors';
import express from 'express';
import { sessionRouter } from './routes/session';
import { onboardingRouter } from './routes/onboarding';
import { servicesRouter } from './routes/services';
import { ordersRouter } from './routes/orders';
import { homeRouter } from './routes/home';
import { profileRouter } from './routes/profile';
import { jobsRouter } from './routes/jobs';
import { deliveryRouter } from './routes/delivery';
import { chatRouter } from './routes/chat';

const app = express();
app.use(cors());
app.use(express.json());

app.get('/api/v1/health', (_req, res) => res.json({ ok: true }));

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

const PORT = Number(process.env.PORT) || 4000;
app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Deeliva placeholder backend listening on http://localhost:${PORT}`);
});
