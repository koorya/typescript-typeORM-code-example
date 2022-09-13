import { EventData, SensorName } from "@alert-service/events/dto/events.dto";
import { EventTypeEnum } from "@alert-service/types";
import * as dotenv from 'dotenv';


dotenv.config();
const TZ = process.env.TZ;


export const formatDate = (
  date: Date,
): string => date.toLocaleString("ru", { dateStyle: 'short', timeZone: TZ })
+ ' ' + date.toLocaleString("ru", { timeStyle: 'medium', timeZone: TZ });

export const formatDateOnly = (
  date: Date,
): string => date.toLocaleString("ru", { dateStyle: 'short', timeZone: TZ });

export const formatTimeOnly = (
  date: Date,
): string => date.toLocaleString("ru", { timeStyle: 'medium', timeZone: TZ });

export const formatTimeDuration = (start_time: Date | string, end_time: Date | string) => `${formatDate(new Date(start_time))} - 
${formatTimeOnly(new Date(end_time))} `;

export function renderMeashurement(data: Extract<EventData, { type: EventTypeEnum.ABNORMAL_SENSOR_VALUES }>['data']) {
  if (data.sensor == SensorName.TH_ST_LEVEL) return `уровня топлива = ${parseInt(data.value) / 1000}мм`;
  else if (data.sensor == SensorName.TH_ST_MASSA) return `массы топлива = ${data.value}тонн`;
  else if (data.sensor == SensorName.TH_ST_PLOTN) return `плотности топлива = ${parseInt(data.value) / 10000}г/мл`;
  else if (data.sensor == SensorName.TH_ST_TEMPER) return `температуры топлива = ${parseInt(data.value) / 2}°`;
  else if (data.sensor == SensorName.TH_ST_VOLUME) return `объема топлива = ${data.value}л`;
  return '';
}

