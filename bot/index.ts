// @ts-nocheck
import { Scenes, session, Telegraf } from 'telegraf';
import * as dotenv from 'dotenv';
import { registerNewUserScene } from './scenes/registerNewUser';
import { Keywords, SCENES } from './const';
import { loginScene } from './scenes/login';
import { mainMenuInteractionScene } from './scenes/mainMenuInteraction';
import { createConnections } from './connections';
import { logBotError, logBotInfo, logButtonPush } from './logs';
import { configure } from 'log4js';
import { getEventByPartialId } from '@common/events_orm_utils';
import { EventTypeEnum } from '@alert-service/types';
import { EventTelegramMessage } from '@orm/entity/telegram/EventTelegramMessage.entity';
import { formatDate, formatTimeOnly } from 'worker/utils';
import { Event } from '@orm/entity/event/Event.entity';
import { getExtraMessageTextByEvent } from '@common/message_render_utils';
import { isAdminChat } from './utils/users';

(async () => {
  dotenv.config();

  configure({
    appenders: {
      to_file: { type: 'file', filename: process.env.LOG_PATH + '/bot.log' },
      to_console: { type: 'console' },
    },
    categories: {
      default: { appenders: ['to_file', 'to_console'], level: 'all' },
    },
  });

  await createConnections();

  const stage = new Scenes.Stage([
    registerNewUserScene,
    loginScene,
    mainMenuInteractionScene,
  ]);

  const bot = new Telegraf(process.env.BOT_TOKEN);

  bot.use(session());
  bot.use(stage.middleware());

  bot.start(async (ctx) => {
    logButtonPush('/start', ctx.chat.id);
    ctx.scene.enter(SCENES.LOGIN);
  });

  // ловим ошибки
  bot.catch((err, ctx) => {
    logBotError(err);
    ctx.reply('Что-то пошло не так, попробуйте снова!');
  });

  bot.hears(Keywords.MENU, async (ctx) => {
    logButtonPush(Keywords.MENU, ctx.chat.id);
    ctx.scene.enter(SCENES.MAIN_MENU_INTERACTION);
  });

  bot.hears(/\/more_([a-f,0-9]{8})/, async (ctx) => {
    await ctx.deleteMessage();
    const part_id = ctx.match[1];

    const event = await getEventByPartialId(part_id);
    if (!event) return;

    const chatId = ctx.chat.id;
    const isAdminCaht = await isAdminChat(chatId);
    let replyText = getExtraMessageTextByEvent(event, isAdminCaht);

    const event_message = await EventTelegramMessage.findOne({ where: { eventId: event.id, telegramChatId: chatId } });
    await ctx.reply(replyText, { reply_to_message_id: event_message?.telegramMessageId, parse_mode: 'HTML' });

  }
  )

  // запуск бота
  bot.launch().then(() => logBotInfo('START'));

  // гасим приложение культурно
  for (const signal of ['SIGTERM', 'SIGINT']) {
    process.once(signal, () => {
      bot.stop(signal);
      logBotInfo('STOP');
    });
  }
})();
