import { Module } from '@nestjs/common';
import { ImagesService } from './images.service';
import { ImagesController } from './images.controller';
// import { ChatGateway } from '../chat/chat.gateway'
import { ChatModule } from '../chat/chat.module'
@Module({
  imports: [ChatModule],
providers: [ImagesService],
  controllers: [ImagesController]
})
export class ImagesModule {}
