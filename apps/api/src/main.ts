import { Logger } from '@nestjs/common';
import { createApp } from './app.setup';

const bootstrap = async () => {
  const app = await createApp();

  const port = process.env.PORT ?? 3001;
  await app.listen(port);
  Logger.log(`Shlanu API running on http://localhost:${port}`, 'Bootstrap');
};

bootstrap();
