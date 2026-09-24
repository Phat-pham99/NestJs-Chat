import { BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { ChatGateway } from '../chat/chat.gateway';
import { ImagesController } from './images.controller';

describe('ImagesController', () => {
  let controller: ImagesController;
  let sendImage: jest.Mock;

  beforeEach(async () => {
    sendImage = jest.fn();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ImagesController],
      providers: [
        {
          provide: ChatGateway,
          useValue: { sendImage },
        },
      ],
    }).compile();

    controller = module.get<ImagesController>(ImagesController);
  });

  it('rejects a missing file', () => {
    expect(() =>
      controller.upload(undefined as unknown as Express.Multer.File),
    ).toThrow(BadRequestException);
  });

  it('forwards an uploaded file to the chat gateway', () => {
    const file = {
      fieldname: 'file',
      originalname: 'image.png',
      encoding: '7bit',
      mimetype: 'image/png',
      size: 4,
      destination: '/tmp',
      filename: 'image.png',
      path: '/tmp/image.png',
      buffer: Buffer.from([0x89, 0x50, 0x4e, 0x47]),
    } as Express.Multer.File;

    controller.upload(file);

    expect(sendImage).toHaveBeenCalledTimes(1);
    expect(sendImage).toHaveBeenCalledWith(file);
  });
});
