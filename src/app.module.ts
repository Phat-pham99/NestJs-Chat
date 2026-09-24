import { Module } from '@nestjs/common';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

import { ImagesModule } from './images/images.module';
import { ChatModule } from './chat/chat.module';

@Module({
  imports: [
    ImagesModule,
    ServeStaticModule.forRoot({
      rootPath: join(process.cwd(), 'client'),
      serveRoot: '/',
    }),
    ChatModule,
  ],
})
export class AppModule {}
