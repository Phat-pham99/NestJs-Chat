import { Module } from '@nestjs/common';
import { ChatModule } from '../chat/chat.module';
import { ImagesController } from './images.controller';
import { ImagesService } from './images.service';

@Module({
  imports: [ChatModule],
  providers: [ImagesService],
  controllers: [ImagesController],
})
export class ImagesModule {}
