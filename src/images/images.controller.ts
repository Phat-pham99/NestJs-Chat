import {
  Controller,
  Post,
  Body,
  UploadedFile, UseInterceptors,
  HttpCode,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ChatGateway } from '../chat/chat.gateway';

@Controller('images')
export class ImagesController {
  private readonly logger = new Logger(ImagesController.name);
  constructor(
    private readonly chatGateway: ChatGateway,
  ) {}

@Post('upload')
@UseInterceptors(FileInterceptor('file'))
@HttpCode(201)
public async Upload(
  @UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('No file selected');
    }
    this.chatGateway.sendImage(file);
    this.logger.log('File received')
    this.logger.debug(`File: ${file.mimetype}`)
    this.logger.debug(`File: ${file.size}`)
    this.logger.debug(`File: ${file.filename}`)
    return {
      message: 'File received',
      data: file
    };
}
}
