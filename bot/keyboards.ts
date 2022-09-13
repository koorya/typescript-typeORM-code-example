import { InlineKeyboardMarkup } from 'telegraf/typings/core/types/typegram';
import { ExtraReplyMessage } from 'telegraf/typings/telegram-types';
import { ACTIONS, Keywords } from './const';
import { getEventList, getUserEventsIds } from './utils/events';
import { EventCategory } from '../server/types';

export const registrationMenu: ExtraReplyMessage = {
  parse_mode: 'Markdown',
  reply_markup: {
    one_time_keyboard: true,
    keyboard: [
      [
        {
          text: 'Отправить контакт',
          request_contact: true,
        },
      ],
    ],
  },
};

export const keyboardToMenu: ExtraReplyMessage = {
  parse_mode: 'Markdown',
  reply_markup: {
    resize_keyboard: true,
    one_time_keyboard: true,
    keyboard: [
      [
        {
          text: Keywords.MENU,
        },
      ],
    ],
  },
};

export const moduleMenu = {
  inline_keyboard: [
    [
      {
        text: 'Подписаться на события в системе',
        callback_data: ACTIONS.SHOW_CATEGORY_EVENT_MENU,
      },
    ],
    [
      {
        text: 'Отправить отзыв по функционированию системы',
        callback_data: ACTIONS.DEVELOPMENT,
      },
    ],
  ],
};

export const moduleMenuExtraReply: ExtraReplyMessage = {
  parse_mode: 'Markdown',
  reply_markup: moduleMenu,
};

export const getEventsMenu = async (
  eventCategory: EventCategory,
  chatId: number,
): Promise<InlineKeyboardMarkup> => {
  const events = await getEventList(eventCategory);

  const userEvents = await getUserEventsIds(chatId);

  const buttons = events.map((event) => [
    {
      text: `${userEvents.includes(event.id) ? '✅' : ''} ${event.name}`,
      callback_data: event.type as string,
    },
  ]);

  buttons.push([
    {
      text: 'Назад ↩️',
      callback_data: ACTIONS.SHOW_CATEGORY_EVENT_MENU,
    },
  ]);

  return {
    inline_keyboard: buttons,
  };
};

export const eventsCategoriesMenu: InlineKeyboardMarkup = {
  inline_keyboard: [
    [
      {
        text: 'Логистика и перевозка',
        callback_data: ACTIONS.SHOW_LOGISTICS_AND_TRANSPORT_MENU,
      },
    ],
    [
      {
        text: 'Склад хранения ГСМ',
        callback_data: ACTIONS.SHOW_STORE_MENU,
      },
    ],
    [
      {
        text: 'АТЗ/ТЗП',
        callback_data: ACTIONS.SHOW_TRANSACTION_EVENTS_MENU,
      },
    ],
    [
      {
        text: 'Назад ↩️',
        callback_data: ACTIONS.SHOW_MAIN_MENU,
      },
    ],
  ],
};
