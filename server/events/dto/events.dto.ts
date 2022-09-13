import { EventTypeEnum } from '@alert-service/types';

type UTCDateString = string;

export enum SensorName {
	TH_ST_VOLUME = 'TH_ST_VOLUME',
	TH_ST_PLOTN = 'TH_ST_PLOTN',
	TH_ST_TEMPER = 'TH_ST_TEMPER',
	TH_ST_LEVEL = 'TH_ST_LEVEL',
	TH_ST_MASSA = 'TH_ST_MASSA',
};


export class ZeroTransactionData {
	type: EventTypeEnum.ZERO_TRANSACTION;
	data: {
		id: string;
		start_time: UTCDateString;
		time: UTCDateString;
		isAtz: boolean;
		liters: number;
		tank: number;
		name: string;
		link: string;
		density: number;
		weight: number;
		to: {
			company: string;
			carmarka: string;
			carnumber: string;
		};
	};
};


export class UnclosedRaceData {
	type: EventTypeEnum.UNCLOSED_RACE;
	data: {
		id: string;
		createdOn: UTCDateString;
		carNumber: string;
		name: string;
		link: string;
	};
};
export class CriticalTzpFuelBalanceData {
	type: EventTypeEnum.CRITICAL_TZP_FUEL_BALANCE;
	data: {
		name: string;
		KM_ID: number;
		LAST_NORMAL_VOLUME_TIME: UTCDateString;
	};

};
export class AbnormalSensorValuesData {
	type: EventTypeEnum.ABNORMAL_SENSOR_VALUES;
	data: {
		tzp_name: string;
		sensor: SensorName;
		value: string;
	};
	// Аномальные показатели {наименование проблемного поля} 
	// в ТЗП {наименование ТЗП по справочнику}

};

export class LackOfConnectionData {
	type: EventTypeEnum.LACK_OF_CONNECTION_WITH_SENSOR;
	data: "LACK_OF_CONNECTION_WITH_SENSOR";
};
export class MysqlConnectionFaultData {
	type: EventTypeEnum.MYSQL_CONNECTION_FAULT;
	data: {
		MeasurementDateTime: Date;
		WarehouseKeys: number[];
		shopKey: number;
	};
};
export class TZPFillingDeviationData {
	type: EventTypeEnum.TZP_FILLING_DEVIATION;
	data: {
		TTNNUM: string;
		KM_ID: number;
		TZP_NAME: string;
		ADDTIME: Date;
		BEGTIME: Date;
		ENDTIME: Date;
		TTNVOLUME: number;
		ACCOUNTVOLUME: number;
		billVolume: number;
		ShopKey: number;
		TrailerNumber: string;
		DriverName: string;
		volumeDeviation: number;
		fillInCount: number;
		fillOutCount: number;
	};
}

export class TZPFillingDayNightSkewData {
	type: EventTypeEnum.TZP_FILLING_DAY_NIGHT_SKEW;
	data: {
		numberOfDayFillings: number;
		numberOfNightFillings: number;
		date: Date;
	};
}



export type EventData =
	{
		data: {
			fbObjectNames: string[];
			shortName: string;
		}
	} &
	(
		| ZeroTransactionData
		| UnclosedRaceData
		| CriticalTzpFuelBalanceData
		| AbnormalSensorValuesData
		| LackOfConnectionData
		| MysqlConnectionFaultData
		| TZPFillingDeviationData
		| TZPFillingDayNightSkewData
	);

export type EventDataHasLink = Extract<EventData, { data: { link: string } }>;
