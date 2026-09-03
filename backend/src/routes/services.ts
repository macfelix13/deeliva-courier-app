import { Router } from 'express';
import { PAYMENT_METHODS, SERVICES } from '../store';

export const servicesRouter = Router();

servicesRouter.get('/services', (_req, res) => {
  res.json(SERVICES);
});

servicesRouter.get('/payment-methods', (_req, res) => {
  res.json(PAYMENT_METHODS);
});

servicesRouter.post('/quote', (req, res) => {
  const { serviceId, weightKg, cover } = req.body ?? {};
  const service = SERVICES.find((s) => s.id === serviceId) ?? SERVICES[1];
  const weight = Number(weightKg) || 0;
  const overweightFee = weight > 10 ? 4 : 0;
  const coverFee = cover ? 1.8 : 0;
  const total = service.price + overweightFee + coverFee;
  res.json({
    serviceId: service.id,
    basePrice: service.price,
    overweightFee,
    coverFee,
    total: Math.round(total * 100) / 100,
  });
});
