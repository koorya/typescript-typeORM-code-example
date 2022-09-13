import { EventTypeEnum } from '@alert-service/types';
import { EventDataWithKey, EventFinder } from './EventFinder';
import { QueryHelper } from './utils/QueryHelper';

export class MysqlConnectionFaultFinder implements EventFinder {
	queryHelper: QueryHelper;
	private _updateIntervalMinutes: number;

	constructor(queryHelper: QueryHelper, updateIntervalMinutes: number | string = 59) {
		this.queryHelper = queryHelper;
		this._updateIntervalMinutes = parseInt(updateIntervalMinutes.toString());
	}

	async find(): Promise<EventDataWithKey[]> {
		const shortName = await this.queryHelper.shortNameByShopKey();
		const fbObjectNamesByShopKey = await this.queryHelper.fbObjectNameByShopKey();
		const meashuredDates = await this.queryHelper.getLastMeashurementDates(this._updateIntervalMinutes);

		const meashureList: { MeasurementDateTime: Date; WarehouseKeys: number[] }[] = [];
		for (const meashure of meashuredDates) {
			if (!meashureList[meashure.ShopKey])
				meashureList[meashure.ShopKey] = { MeasurementDateTime: meashure.MeasurementDateTime, WarehouseKeys: [] };

			meashureList[meashure.ShopKey].WarehouseKeys.push(meashure.WarehouseKey);
		}
		const res = meashureList.map(({ MeasurementDateTime, WarehouseKeys }, shopKey): EventDataWithKey => {

			return {
				key: shopKey.toString(),
				type: EventTypeEnum.MYSQL_CONNECTION_FAULT,
				data: { MeasurementDateTime, WarehouseKeys, shopKey, shortName: shortName[shopKey], fbObjectNames: fbObjectNamesByShopKey[shopKey] }
			};
		}).filter(el => el);
		return res;
	}
}
