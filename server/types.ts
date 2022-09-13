export enum EventCategory {
  LOGISTICS = 'logistics',
  WAREHOUSE = 'warehouse',
  TRANSACTIONS_AND_STATE = 'transactions_and_state',
}

export enum EventTypeEnum {
  UNCLOSED_RACE = 'unclosed_race',
  ZERO_TRANSACTION = 'zero_transaction',
  CRITICAL_TZP_FUEL_BALANCE = 'critical_tzp_fuel_balance',
  LACK_OF_CONNECTION_WITH_SENSOR = 'lack_of_connection_with_sensor',
  ABNORMAL_SENSOR_VALUES = 'abnormal_sensor_values',
  MYSQL_CONNECTION_FAULT = 'mysql_connection_fault',
  TZP_FILLING_DEVIATION = 'tzp_filling_deviation',
  TZP_FILLING_DAY_NIGHT_SKEW = 'tzp_filling_day_night_skew',
}

export enum EventStatus { ACTIVE = 'active', INACTIVE = 'inactive' };




