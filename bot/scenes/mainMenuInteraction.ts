import { Scenes } from 'telegraf';
import { ACTIONS, SCENES, UserRole } from '../const';
import {
  eventsCategoriesMenu,
  getEventsMenu,
  keyboardToMenu,
  moduleMenuExtraReply,
  moduleMenu,
} from '../keyboards';
import {
  getEventByType,
  getUserEventsIds,
  subscribeEvent,
  unSubscribeEvent,
} from '../utils/events';
import { EventCategory, EventTypeEnum } from '@alert-service/types';
import { getLocalUserByChatId } from '../utils/users';

export const mainMenuInteractionScene = new Scenes.BaseScene(
  SCENES.MAIN_MENU_INTERACTION,
);

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

export const roleGuard = async (ctx, callback) => {
  const data = await getLocalUserByChatId(ctx.chat.id);

  if (data?.userRole && data?.userRole !== UserRole.CLIENT) {
    await callback();
  } else {
    await ctx.reply('У вас недостаточно прав для дальнейших действий.');
    return;
  }
};

mainMenuInteractionScene.enter(async (ctx) => {
  const callback = async () => {
    await ctx.replyWithMarkdown('...', keyboardToMenu);

    await ctx.reply('Главное меню:', moduleMenuExtraReply);
  };

  await roleGuard(ctx, callback);
});

mainMenuInteractionScene.action(ACTIONS.SHOW_CATEGORY_EVENT_MENU, (ctx) => {
  ctx.editMessageReplyMarkup(eventsCategoriesMenu);
});

mainMenuInteractionScene.action(
  ACTIONS.SHOW_TRANSACTION_EVENTS_MENU,
  async (ctx) => {
    const eventsMenu = await getEventsMenu(
      EventCategory.TRANSACTIONS_AND_STATE,
      ctx.chat.id,
    );

    ctx.editMessageReplyMarkup(eventsMenu);
  },
);

mainMenuInteractionScene.action(
  ACTIONS.SHOW_LOGISTICS_AND_TRANSPORT_MENU,
  async (ctx) => {
    const eventsMenu = await getEventsMenu(
      EventCategory.LOGISTICS,
      ctx.chat.id,
    );

    ctx.editMessageReplyMarkup(eventsMenu);
  },
);

mainMenuInteractionScene.action(
  ACTIONS.SHOW_STORE_MENU,
  async (ctx) => {
    const eventsMenu = await getEventsMenu(
      EventCategory.WAREHOUSE,
      ctx.chat.id,
    );

    ctx.editMessageReplyMarkup(eventsMenu);
  },
);

mainMenuInteractionScene.action(ACTIONS.SHOW_MAIN_MENU, async (ctx) => {
  await ctx.editMessageReplyMarkup(moduleMenu);
});

mainMenuInteractionScene.action(ACTIONS.DEVELOPMENT, async (ctx) => {
  const message = await ctx.reply('Раздел находится в разработке...');
  await sleep(1000);
  await ctx.deleteMessage(message.message_id);
});

Object.keys(EventTypeEnum).forEach((key) => {
  const eventType = EventTypeEnum[key];

  mainMenuInteractionScene.action(eventType, async (ctx) => {
    const eventData = await getEventByType(eventType);

    const userEventsIds = await getUserEventsIds(ctx.chat.id);

    if (userEventsIds.includes(eventData.id)) {
      await unSubscribeEvent(eventData.id, ctx.chat.id);
    } else {
      await subscribeEvent(eventData.id, ctx.chat.id);
    }

    const eventsMenu = await getEventsMenu(eventData.category, ctx.chat.id);

    ctx.editMessageReplyMarkup(eventsMenu);
  });
});
