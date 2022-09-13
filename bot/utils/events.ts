import { getRepository } from '../connections';
import { EventSubscription } from '@entity/telegram/EventSubscription.entity';
import { EventType } from '@entity/common/EventType.entity';
import { EventCategory, EventTypeEnum } from '@alert-service/types';
import { TelegramUserData } from '@orm/entity/telegram/TelegramUserData.entity';
import { UserRole } from 'bot/const';

export const subscribeEvent = async (
  eventId: string,
  telegramChatId: number,
) => {
  const eventSubscriptionRepository = getRepository(EventSubscription);

  const newMappingItem = eventSubscriptionRepository.create({
    eventId,
    telegramChatId: telegramChatId.toString(),
  });

  await eventSubscriptionRepository.save(newMappingItem);
};

export const unSubscribeEvent = async (
  eventId: string,
  telegramChatId: number,
) => {
  const eventSubscriptionRepository = getRepository(EventSubscription);

  await eventSubscriptionRepository.delete({
    eventId,
    telegramChatId: telegramChatId.toString(),
  });
};

export const getUserEventsIds = async (telegramChatId: number) => {
  const eventSubscriptionRepository = getRepository(EventSubscription);

  const subscriptions = await eventSubscriptionRepository.find({
    where: { telegramChatId: telegramChatId.toString() },
  });

  return subscriptions.map((item) => item.eventId);
};

export const getSubscribedChats = async (eventId: string) => {
  const eventSubscriptionRepository = getRepository(EventSubscription);

  const subscriptions = await eventSubscriptionRepository.find({
    where: { eventId },
  });

  return subscriptions.map((item) => item.telegramChatId);
};



export const getEventByType = async (type: EventTypeEnum) => {
  const eventRepository = getRepository(EventType);
  return eventRepository.findOne({ where: { type } });
};

export const getEventList = async (category: EventCategory) => {
  const eventRepository = getRepository(EventType);
  return eventRepository.find({ where: { category } });
};
