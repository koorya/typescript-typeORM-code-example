// @ts-nocheck
import { Scenes } from 'telegraf';
import { registrationMenu } from '../keyboards';
import { SCENES } from '../const';
import admin from 'firebase-admin';
import { getRepository } from '../connections';
import { TelegramUserData } from '@entity/telegram/TelegramUserData.entity';
import { createLocalUser, getRosnovaUserByPhone } from '../utils/users';

export const loginScene = new Scenes.WizardScene(
  SCENES.LOGIN,
  async (ctx) => {
    const userData = await getRepository(TelegramUserData).findOne({
      where: {
        telegramChatId: ctx.chat.id,
      },
    });

    if (!userData) {
      await ctx.reply(
        'Для регистрации отправьте свой контакт',
        registrationMenu,
      );
      ctx.wizard.next();
    } else {
      const rosnovaUser = await admin.auth().getUser(userData.rosnovaUserId);
      await ctx.reply(`${rosnovaUser.displayName}, добро пожаловать!`);
      await ctx.scene.enter(SCENES.MAIN_MENU_INTERACTION);
    }
  },
  async (ctx) => {
    const phoneNumber = ctx.message.contact?.phone_number;

    if (!phoneNumber) {
      await ctx.scene.enter(SCENES.LOGIN);
      return;
    }

    const currentUser = await getRosnovaUserByPhone(phoneNumber);

    if (!currentUser) {
      await ctx.scene.enter(SCENES.REGISTER_NEW_USER, { phoneNumber });
    } else {
      const userRole = currentUser.customClaims?.role;

      await createLocalUser({
        telegramChatId: ctx.chat.id.toString(),
        rosnovaUserId: currentUser.uid,
        userRole,
      });

      await ctx.reply(`${currentUser.displayName}, добро пожаловать!`);

      await ctx.scene.enter(SCENES.MAIN_MENU_INTERACTION);
    }
  },
);
