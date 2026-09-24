import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { getCorsOptions } from './config/cors';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors(getCorsOptions());

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
