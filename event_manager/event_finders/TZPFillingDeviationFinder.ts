import { EventTypeEnum } from '@alert-service/types';
import { EventDataWithKey, EventFinder } from './EventFinder';
import { QueryHelper } from './utils/QueryHelper';

export class TZPFillingDeviationFinder implements EventFinder {
  queryHelper: QueryHelper;
  private _deviationCutoff: number;

  constructor(queryHelper: QueryHelper, deviationCutoff: number = 0) {
    this.queryHelper = queryHelper;
    this._deviationCutoff = deviationCutoff;
  }
  async find() {
    const TZPFillingEvent = await this.queryHelper.getTZPFillingFirebirdInfo();

    const bills = await this.queryHelper.getTZPFillingMySQLInfo();


    const tzpDataByTankNumber = await this.queryHelper.tzpDataByTankNumber();
    const TZPFillingEventExtended = TZPFillingEvent
      .map(({ KM_IDS: [KM_ID], ...rest }) => ({ KM_ID, ...rest, tzpData: tzpDataByTankNumber.find(({ id }) => id == KM_ID) }))
      .filter(({ tzpData }) => !!tzpData);



    const TZPFillingEventExtendedWithBill = TZPFillingEventExtended.map(({ tzpData,
      TTNNUM,
      ...rest }) => ({
        tzpData,
        TTNNUM,
        ...rest,
        bill: bills.filter((b) => b.TTNNUM == TTNNUM.toString() &&
          b.organizationKey == tzpData.OrganizationKey &&
          b.shopKey == tzpData.shopKey)
          .sort((a, b) =>
            a.transactiondatetime.getTime() - b.transactiondatetime.getTime())
          .pop()
      }))
      .filter(({ bill }) => !!bill)
      .filter(({ bill: { transactiondatetime }, MAXADDTIME }) => Math.abs(MAXADDTIME.getTime() - transactiondatetime.getTime()) < 24 * 60 * 60 * 1000);

    // Выдано bill.volume
    // Указано TTNVOLUME
    // Залито ACCOUNTVOLUME
    const largeDeviation = TZPFillingEventExtendedWithBill.map(fillingEvent => {
      const { TTNVOLUME, ACCOUNTVOLUME, bill: { volume } } = fillingEvent;
      return { volumeDeviation: Math.round(volume - ACCOUNTVOLUME), ...fillingEvent }
    }).filter(
      ({ volumeDeviation }) => {
        return Math.abs(volumeDeviation) >= this._deviationCutoff;
      }
    );


    return largeDeviation.map(
      (deviationTransaction): EventDataWithKey =>
      ({
        type: EventTypeEnum.TZP_FILLING_DEVIATION,
        key: `key_${EventTypeEnum.TZP_FILLING_DEVIATION}_${deviationTransaction.ID}`,
        data: {
          fbObjectNames: [deviationTransaction.tzpData.fbObjectName],
          shortName: deviationTransaction.tzpData.shortName,
          ACCOUNTVOLUME: deviationTransaction.ACCOUNTVOLUME,
          ADDTIME: deviationTransaction.MAXADDTIME,
          billVolume: deviationTransaction.bill.volume,
          DriverName: deviationTransaction.bill.DriverName,
          KM_ID: deviationTransaction.KM_ID,
          TZP_NAME: deviationTransaction.tzpData.name,
          ShopKey: deviationTransaction.tzpData.shopKey,
          TrailerNumber: deviationTransaction.bill.TrailerNumber,
          TTNNUM: deviationTransaction.TTNNUM.toString(),
          TTNVOLUME: deviationTransaction.TTNVOLUME,
          volumeDeviation: deviationTransaction.volumeDeviation,
          BEGTIME: deviationTransaction.BEGTIME,
          ENDTIME: deviationTransaction.ENDTIME,
          fillInCount: deviationTransaction.bill.FILLINCOUNT,
          fillOutCount: deviationTransaction.FILLOUTCOUNT,
        },
      })
    );
  }
}
