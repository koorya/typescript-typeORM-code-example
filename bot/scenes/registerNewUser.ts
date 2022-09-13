// @ts-nocheck
import { Scenes } from 'telegraf';
import { SCENES, UserRole } from '../const';
import admin from 'firebase-admin';
import { createLocalUser } from '../utils/users';

export const registerNewUserScene = new Scenes.WizardScene(
  SCENES.REGISTER_NEW_USER,
  (ctx) => {
    ctx.reply('Введите ФИО');
    ctx.wizard.next();
  },
  async (ctx) => {
    ctx.wizard.state.userName = ctx.message.text;

    const newUser = await admin.auth().createUser({
      displayName: ctx.wizard.state.userName,
      phoneNumber: `+${ctx.wizard.state.phoneNumber}`,
    });

    const userRole = UserRole.CLIENT;

    await admin.auth().setCustomUserClaims(newUser.uid, { role: userRole });

    await createLocalUser({
      telegramChatId: ctx.chat.id.toString(),
      rosnovaUserId: newUser.uid,
      userRole: userRole,
    });

    await ctx.reply(`${newUser.displayName}, добро пожаловать!`);

    await ctx.scene.enter(SCENES.MAIN_MENU_INTERACTION);
  },
);
