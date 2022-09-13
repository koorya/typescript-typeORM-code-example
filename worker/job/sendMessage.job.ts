import { Event } from '@entity/event/Event.entity';
import {
  formatDate, formatDateOnly, formatTimeDuration, formatTimeOnly, renderMeashurement,
} from '../utils';
import {
  logMessageSenderError,
  logMessageSenderInfo
} from "../../common/log_utils";
import * as dotenv from 'dotenv';
import { getSubscribedChats } from '../../bot/utils/events';
import { EventTelegramMessage } from '@entity/telegram/EventTelegramMessage.entity';
import { addHours } from 'date-fns';
import { getRepository, MoreThan } from 'typeorm';
import { EventData, EventDataHasLink, SensorName } from '@alert-service/events/dto/events.dto';
import { EventStatus, EventTypeEnum } from '@alert-service/types';
import fetch from 'node-fetch';
import { getRosnovaUserIdList, getUserObjectsByRosnovaUidList, getUserObjectsByTelegramChatId, getUserObjectsByTelegramChatIdCached, isAdminChat } from 'bot/utils/users';
import { new_line } from '@common/message_render_utils';

dotenv.config();


const sendHtmlMessageToBot = async (chatId: string, message: string) =>
  fetch(
    `https://api.telegram.org/bot${process.env.BOT_TOKEN}/sendMessage?parse_mode=html&text=${message.replace(/\s+/g, ' ')}&chat_id=${chatId}`,
  ).then((data) => data.json());


const getBaseMessageByEventData = ({ data: eventData, id: eventId }: Event, isAdmin: boolean) => {
  const { type, data } = eventData;
  const objectNameIfRenderExtra = isAdmin ? `<b>${data.shortName}:</b> ` : '';
  const moreCommand = `${new_line}<b>Подробнее:</b> /more_${eventId.split('-')[0]}`;
  switch (type) {
    case EventTypeEnum.ZERO_TRANSACTION:
      return `${objectNameIfRenderExtra}Некорректная транзакция выдачи топлива из ${data.isAtz ? 'АТЗ' : 'ТЗП'}
      ${data.name || ''} в ${formatTimeDuration(data.start_time, data.time)} 
      ${moreCommand}`;
    case EventTypeEnum.CRITICAL_TZP_FUEL_BALANCE:
      return `${objectNameIfRenderExtra}В ТЗП ${data.name} критический уровень топлива`;
    case EventTypeEnum.UNCLOSED_RACE:
      return `${objectNameIfRenderExtra}Рейс №${data.name} автомобиля ${data.carNumber} находится в пути более 24х часов ${isAdmin ? moreCommand : ''}`;
    case EventTypeEnum.LACK_OF_CONNECTION_WITH_SENSOR:
      return `${objectNameIfRenderExtra}Отсутствует связь с датчиком GPS у АТЗ {nomer} более 24 часов`;
    case EventTypeEnum.ABNORMAL_SENSOR_VALUES:
      return `${objectNameIfRenderExtra}Аномальные показатели ${renderMeashurement(data)} в ТЗП ${data.tzp_name}`;
    case EventTypeEnum.MYSQL_CONNECTION_FAULT:
      return `${objectNameIfRenderExtra}Отсутствует обмен данными со складом ГСМ от ${formatDate(new Date(data.MeasurementDateTime))}.`;
    case EventTypeEnum.TZP_FILLING_DEVIATION:
      return `${objectNameIfRenderExtra}Отклонение значений при пополнении ТЗП ${data.TZP_NAME} (${data.KM_ID})\
      ${new_line}<b>АТЗ:</b> ${data.TrailerNumber}\
      ${new_line}<b>Отклонение:</b> ${data.volumeDeviation > 0 ? '+' : ''}${data.volumeDeviation} л\
      ${new_line}<b>ТТН:</b> ${data.TTNNUM}\
      ${new_line}<b>Выдано/Указано/Залито:</b> ${data.billVolume}/${data.TTNVOLUME}/${data.ACCOUNTVOLUME} л\
      ${new_line}<b>Количество заправок/сливов:</b> ${data.fillInCount}/${data.fillOutCount}\
      ${new_line}<b>Время слива:</b> ${formatTimeDuration(data.BEGTIME, data.ENDTIME)}`;
    case EventTypeEnum.TZP_FILLING_DAY_NIGHT_SKEW:
      return `${objectNameIfRenderExtra}Превышено отношение ночных/дневных (${data.numberOfNightFillings}/${data.numberOfDayFillings}) заправок ${formatDateOnly(new Date(data.date))}`;
  }
};




const getActiveEvents = () =>
  getRepository(Event)
    .createQueryBuilder('event')
    .select(['event'])
    .addSelect('eventtype')
    .leftJoin('event.type', 'eventtype')
    .where('event.status = :status', { status: EventStatus.ACTIVE })
    .getMany();

const isValidEventToSend = async (eventId: string, chatId: string) => {
  const eventTelegramMessage = await EventTelegramMessage.find({
    where: {
      eventId,
      telegramChatId: chatId,
      // если нужно отправлять сообщение более одного раза
      // created: MoreThan(addHours(new Date(), -12)),
    },
  });

  return eventTelegramMessage.length === 0;
};

const saveMessage = async (chatId: string, eventId: string, message_id: number) => {
  const repository = getRepository(EventTelegramMessage);

  const eventTelegramMessage = repository.create({
    eventId,
    telegramChatId: chatId,
    telegramMessageId: message_id,
  });
  await repository.save(eventTelegramMessage);
};

export const sendMessagesJob = async () => {
  try {
    logMessageSenderInfo('START');
    const activeEvents = await getActiveEvents();

    logMessageSenderInfo('Кол-во активных ивентов:', activeEvents?.length);

    let sendedCount = 0;
    let notSendedCount = 0;
    let alreadySended = 0;
    const rosnovaUidList = await getRosnovaUserIdList();
    const userObjectsByUidMap = await getUserObjectsByRosnovaUidList(rosnovaUidList);
    await Promise.all(
      activeEvents.map(async (event) => {
        const subscribedChats = await getSubscribedChats(event.type.id);

        for (const chatId of subscribedChats) {
          const isSendValid = await isValidEventToSend(event.id, chatId);
          const isAdminCaht = await isAdminChat(chatId);
          const userObjects = await getUserObjectsByTelegramChatIdCached(chatId, userObjectsByUidMap);
          const isUserObjectsMatch = !event.data.data.fbObjectNames?.length ||
            userObjects?.find(obj => event.data.data.fbObjectNames.includes(obj));
          if (isSendValid && (isUserObjectsMatch || isAdminCaht)) {
            const message = getBaseMessageByEventData(event, isAdminCaht);
            const response = await sendHtmlMessageToBot(chatId, message);
            if (response.ok) {
              const message_id = response.result.message_id;
              await saveMessage(chatId, event.id, message_id);
              sendedCount++;
            } else {
              notSendedCount++;
            }
          } else {
            alreadySended++;
          }
        }
      }),
    );

    logMessageSenderInfo(
      `Сообщений отправлено: ${sendedCount}; Ранее отправлено: ${alreadySended}; Сообщений НЕ отправлено: ${notSendedCount} `,
    );
  } catch (e) {
    logMessageSenderError(e);
  } finally {
    logMessageSenderInfo('FINISH');
  }
};
