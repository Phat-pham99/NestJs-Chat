import { MessageTypeEnum } from '../enums/message-type.enum';

export interface messageInterface {
  name: string;
  type: MessageTypeEnum;
  message: string;
}
