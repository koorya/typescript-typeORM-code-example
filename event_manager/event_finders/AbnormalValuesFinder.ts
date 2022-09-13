import { SensorName } from '@alert-service/events/dto/events.dto';
import { EventTypeEnum } from '@alert-service/types';
import { EventDataWithKey, EventFinder } from './EventFinder';
import { QueryHelper } from './utils/QueryHelper';

export class AbnormalValuesFinder implements EventFinder {
  queryHelper: QueryHelper;

  constructor(queryHelper: QueryHelper) {
    this.queryHelper = queryHelper;
  }

  async find(): Promise<EventDataWithKey[]> {
    const tpzDataByTankNumber = await this.queryHelper.tzpDataByTankNumber();

    const meashuredValues = await this.queryHelper.meashuredValues();
    const abnormalValues: EventDataWithKey[] = meashuredValues.map(({ KM_ID, TH_ST_TIME, ...VALUES }) => {
      const currentTpz = tpzDataByTankNumber.find(({ id }) => KM_ID === id);
      if (!currentTpz) {
        return [];
      }
      const tzpName = currentTpz.name;
      const tzpVolume = currentTpz.volume;
      const fbObjectName = currentTpz.fbObjectName;
      const shortName = currentTpz.shortName;
      const fbData = {
        fbObjectNames: [fbObjectName],
        shortName,
        tzp_name: tzpName,
      };
      const abnormal: EventDataWithKey[] = [];
      const isTest = false;
      for (const valueIndex in VALUES) {
        const value = VALUES[valueIndex];
        if (valueIndex === SensorName.TH_ST_LEVEL) {
          // TH_ST_LEVEL не ниже 0
          if (isTest || value < 0)
            abnormal.push({
              key: KM_ID + valueIndex, type: EventTypeEnum.ABNORMAL_SENSOR_VALUES,
              data: {
                ...fbData,
                sensor: valueIndex,
                value: value
              }
            });
        }
        else if (valueIndex === SensorName.TH_ST_PLOTN) {
          // TH_ST_PLOTN должна быть в пределах от 0.75 до 0.9
          if (isTest || value < 7500 || value > 9000)
            abnormal.push({
              key: KM_ID + valueIndex, type: EventTypeEnum.ABNORMAL_SENSOR_VALUES,
              data: {
                ...fbData,
                sensor: valueIndex,
                value: value
              }
            });
        }
        else if (valueIndex === SensorName.TH_ST_TEMPER) {
          // TH_ST_TEMPER больше 50 градусов не мож быть  
          // там пополам делить надо
          // 25.5 там на самом деле, из-за того что там 2 терминала  выдачи топлива на 1 резервуар вроде он в два раза больше делает значение
          if (isTest || value / 2 > 50)
            abnormal.push({
              key: KM_ID + valueIndex, type: EventTypeEnum.ABNORMAL_SENSOR_VALUES,
              data: {
                ...fbData,
                sensor: valueIndex,
                value: value
              }
            });
        }
        else if (valueIndex === SensorName.TH_ST_VOLUME) {
          // Типа бакс 28к литров в показывает 32к
          // TH_ST_VOLUME и TH_ST_MASSA не может быть больше обьема резервуара (в фб там стоят обьемы резервуара)
          if (isTest || value > tzpVolume)
            abnormal.push({
              key: KM_ID + valueIndex, type: EventTypeEnum.ABNORMAL_SENSOR_VALUES,
              data: {
                ...fbData,
                sensor: valueIndex,
                value: value
              }
            });
        }
        else if (valueIndex === SensorName.TH_ST_MASSA) {
          // TH_ST_VOLUME и TH_ST_MASSA не может быть больше обьема резервуара (в фб там стоят обьемы резервуара)
          // объем бака по паспорту на максимальную мыслимую плотность (value в тоннах, tpzVolume в литрах)
          if (isTest || value * 1000 > tzpVolume * 0.9)
            abnormal.push({
              key: KM_ID + valueIndex, type: EventTypeEnum.ABNORMAL_SENSOR_VALUES,
              data: {
                ...fbData,
                sensor: valueIndex,
                value: value
              }
            });
        }

      }
      return abnormal;
    }).flat();


    return abnormalValues;
  }
}
