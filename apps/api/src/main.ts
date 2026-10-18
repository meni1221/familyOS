import { createApp } from './app.setup';

const bootstrap = async () => {
  const app = await createApp();

  const port = process.env.PORT ?? 3001;
  await app.listen(port);
  console.log(`Shlanu API running on http://localhost:${port}`);
};

bootstrap();
