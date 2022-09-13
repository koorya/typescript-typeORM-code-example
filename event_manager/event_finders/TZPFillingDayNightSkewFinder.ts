import { EventTypeEnum } from '@alert-service/types';
import { groupBy } from '@common/node_utils';
import { EventDataWithKey, EventFinder } from './EventFinder';
import { QueryHelper } from './utils/QueryHelper';

export class TZPFillingDayNightSkewFinder implements EventFinder {
	queryHelper: QueryHelper;
	private _skewFactor: number;

	constructor(queryHelper: QueryHelper, skewFactor = 1) {
		this.queryHelper = queryHelper;
		this._skewFactor = skewFactor;
	}
	async find() {
		const TZPFillingEvents = await this.queryHelper.getTZPFillingDayNaightSkew();

		const dateadd = TZPFillingEvents[0].dateadd;

		const tzpDataByTankNumber = await this.queryHelper.tzpDataByTankNumber();
		const TZPFillingEventsExtended = TZPFillingEvents
			.map(({ km_id, ...rest }) => ({ km_id, ...rest, tzpData: tzpDataByTankNumber.find(({ id }) => id == km_id) }))
			.filter(({ tzpData }) => !!tzpData);

		const fueling_list: { day: number; night: number; shortName: string; fbObjectName: string; date: Date; }[] = [];

		const grouped = groupBy(TZPFillingEventsExtended, ({ tzpData: { fbObjectName } }) => fbObjectName);
		for (const [fbObjectName, value] of grouped) {
			const grouped_by_day_night = groupBy(value, ({ day_night }) => day_night);
			const day_night_counter = new Map<"day" | "night", number>();
			for (const [day_night, event] of grouped_by_day_night) {
				const count = event.reduce((a, value) => a += value.count, 0);
				day_night_counter.set(day_night, count);
			}
			fueling_list.push({ fbObjectName, day: day_night_counter.get("day"), night: day_night_counter.get("night"), shortName: grouped_by_day_night.get("day")[0].tzpData.shortName, date: dateadd });
		}

		return fueling_list.filter(({ day, night }) => night / day >= this._skewFactor).map(
			({ date, day, fbObjectName, night, shortName }): EventDataWithKey =>
			({
				type: EventTypeEnum.TZP_FILLING_DAY_NIGHT_SKEW,
				key: `key_${EventTypeEnum.TZP_FILLING_DAY_NIGHT_SKEW}_${date}_${fbObjectName}`,
				data: {
					fbObjectNames: [fbObjectName],
					shortName: shortName,
					date: date,
					numberOfDayFillings: day,
					numberOfNightFillings: night,
				},
			})
		);
	}
}
