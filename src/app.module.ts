import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

import { ChatGateway } from './chat/chat.gateway';
import { ImagesModule } from './images/images.module';
import { ChatModule } from './chat/chat.module';

@Module({
  imports: [
    ImagesModule,
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'client'),
      serveRoot: '/',
    }),
    ChatModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
