import { Router } from 'express';
import { db, persist } from '../store';
import { Job } from '../types';

export const deliveryRouter = Router();

interface StepInfo {
  title: string;
  cta: string;
  kicker: string;
  addr: string;
  note: string;
}

function stepsFor(job: Job): StepInfo[] {
  return [
    { title: 'Head to pickup', cta: 'I have arrived', kicker: 'Pickup', addr: job.pickupAddress, note: `Confirm the pickup details with the sender before you leave. Job ${job.ref}.` },
    { title: 'Scan the parcel', cta: 'Confirm scan', kicker: 'Pickup', addr: job.pickupAddress, note: `${job.kind}. Check the label matches ${job.ref} before you leave.` },
    { title: 'Drive to drop-off', cta: 'I have arrived', kicker: 'Drop-off', addr: job.dropAddress, note: `Heading to the drop-off for ${job.ref}.` },
    { title: 'Proof of delivery', cta: 'Complete delivery', kicker: 'Drop-off', addr: job.dropAddress, note: 'Photo or signature — either is fine, both if the parcel is left with reception.' },
    { title: 'Job complete', cta: 'Back to jobs', kicker: 'Drop-off', addr: job.dropAddress, note: 'Nice work. Your next job is already in the queue.' },
  ];
}

function activeJob(): Job | undefined {
  return db.jobs.find((j) => j.status === 'accepted' && j.courierId === db.users.courier.id);
}

function serialize(job: Job) {
  const steps = stepsFor(job);
  const step = steps[Math.min(job.deliveryStep, steps.length - 1)];
  return {
    ref: job.ref,
    stepIndex: job.deliveryStep,
    stepLabel: `Step ${Math.min(job.deliveryStep + 1, 4)} of 4`,
    title: step.title,
    cta: step.cta,
    addrKicker: step.kicker,
    addr: step.addr,
    note: step.note,
    isScan: job.deliveryStep === 1,
    isProof: job.deliveryStep === 3,
    isDone: job.deliveryStep === 4,
    receiver: job.receiver,
    proof: job.proof,
    payout: `£${job.pay.toFixed(2)}`,
  };
}

deliveryRouter.get('/delivery/active', (_req, res) => {
  const job = activeJob();
  res.json({ active: job ? serialize(job) : null });
});

deliveryRouter.patch('/delivery/active', (req, res) => {
  const job = activeJob();
  if (!job) {
    res.status(404).json({ error: 'no active delivery' });
    return;
  }
  const { receiver, proof } = req.body ?? {};
  if (typeof receiver === 'string') job.receiver = receiver;
  if (proof === 'photo' || proof === 'sign') job.proof = proof;
  persist();
  res.json({ active: serialize(job) });
});

deliveryRouter.post('/delivery/advance', (_req, res) => {
  const job = activeJob();
  if (!job) {
    res.status(404).json({ error: 'no active delivery' });
    return;
  }
  if (job.deliveryStep >= 4) {
    job.status = 'delivered';
    persist();
    res.json({ active: null });
    return;
  }
  job.deliveryStep += 1;
  persist();
  res.json({ active: serialize(job) });
});
