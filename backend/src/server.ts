import { app } from './app';

const PORT = Number(process.env.PORT) || 4000;
app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Deeliva backend listening on http://localhost:${PORT}`);
});
