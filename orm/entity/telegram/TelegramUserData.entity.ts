/* eslint-disable camelcase */
import {
  Column,
  CreateDateColumn,
  Entity as EntityORM,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { UserRole } from 'bot/const';

@EntityORM('telegram_user_data')
export class TelegramUserData {
  @PrimaryGeneratedColumn('increment')
  id: string;

  @CreateDateColumn({ type: 'timestamp with time zone', name: 'created' })
  createdDate: Date;

  @Column({
    type: 'character varying',
    length: 30,
    unique: true,
    name: 'rosnova_user_id',
  })
  rosnovaUserId: string;

  @Column({
    type: 'character varying',
    length: 15,
    unique: true,
    name: 'telegram_chat_id',
  })
  telegramChatId: string;

  @Column({ type: 'enum', enum: UserRole, nullable: true, name: 'user_role' })
  userRole: UserRole;
}
