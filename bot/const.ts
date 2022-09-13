export enum SCENES {
  REGISTER_NEW_USER = 'REGISTER_NEW_USER_WIZARD_SCENE',
  LOGIN = 'LOGIN_WIZARD_SCENE',
  MAIN_MENU_INTERACTION = 'MAIN_MENU_INTERACTION_BASE_SCENE',
}

export enum ACTIONS {
  DEVELOPMENT = 'development',
  SHOW_TRANSACTION_EVENTS_MENU = 'showEventMenu',
  SHOW_LOGISTICS_AND_TRANSPORT_MENU = 'showLogisticsAndTransportMenu',
  SHOW_STORE_MENU = 'showStoreMenu',
  SHOW_CATEGORY_EVENT_MENU = 'showCategoryEventMenu',
  SHOW_MAIN_MENU = 'showMainMenu',
}

export enum UserRole {
  SECURITY = 'security',
  SPECIALIST = 'specialist',
  DRIVER = 'driver',
  COMPANY = 'company',
  ADMIN = 'admin',
  OPERATOR = 'operator',
  DRIVER_ATZ = 'driveratz',
  CLIENT = 'client',
}

export enum Keywords {
  MENU = 'меню',
}
