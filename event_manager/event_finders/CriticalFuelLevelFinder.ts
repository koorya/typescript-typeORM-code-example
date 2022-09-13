import { EventTypeEnum } from '@alert-service/types';
import { EventDataWithKey, EventFinder } from './EventFinder';
import { QueryHelper } from './utils/QueryHelper';

export class CriticalFuelLevelFinder implements EventFinder {
  queryHelper: QueryHelper;

  constructor(queryHelper: QueryHelper) {
    this.queryHelper = queryHelper;
  }

  async find() {
    const tpzNameByTankNumber = await this.queryHelper.tzpDataByTankNumber();

    const lastMeashuredNormalLevel =
      await this.queryHelper.lastMeashuredNormalLevel(
        tpzNameByTankNumber.map(({ id }) => id),
      );
    const idWithLowLevel = await this.queryHelper.idWithLowLevel();

    const data = lastMeashuredNormalLevel.filter(({ KM_ID }) =>
      idWithLowLevel.includes(KM_ID),
    );

    const res = data.map(
      ({ KM_ID, LAST_NORMAL_VOLUME_TIME }): EventDataWithKey => ({
        type: EventTypeEnum.CRITICAL_TZP_FUEL_BALANCE,
        key: KM_ID.toString() + LAST_NORMAL_VOLUME_TIME,
        data: {
          fbObjectNames: [tpzNameByTankNumber.find(({ id }) => id == KM_ID)?.fbObjectName],
          shortName: tpzNameByTankNumber.find(({ id }) => id == KM_ID)?.shortName,
          KM_ID,
          LAST_NORMAL_VOLUME_TIME: LAST_NORMAL_VOLUME_TIME.toUTCString(),
          name: tpzNameByTankNumber.find(({ id }) => id == KM_ID)?.name,
        },
      }),
    );

    return res;
  }
}
