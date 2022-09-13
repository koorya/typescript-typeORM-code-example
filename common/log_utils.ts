import { getLogger } from 'log4js';

const getLocalLogger = (category, level) => {
	const logger = getLogger(category);
	logger.level = level;
	return logger;
};

export const logJobExecutionInfo = (jobName, message, ...args) => getLocalLogger(`Job Execution: ${jobName}`, 'info').info(message, ...args);

export const logEventManagerInfo = (message, ...args) => getLocalLogger('Generate Events Job', 'info').info(message, ...args);

export const logEventManagerError = (message, ...args) => getLocalLogger('Generate Events Job', 'error').error(message, ...args);

export const logMessageSenderInfo = (message, ...args) => getLocalLogger('Message Sender', 'info').info(message, ...args);

export const logMessageSenderError = (message, ...args) => getLocalLogger('Message Sender', 'error').error(message, ...args);

export const logWorkerServiceInfo = (message, ...args) => getLocalLogger('Worker Service', 'info').info(message, ...args);

export const logEventExecuterInfo = (message, ...args) => getLocalLogger('Event finder executer', 'info').info(message, ...args);

export const logEventExecuterError = (message, ...args) => getLocalLogger('Event finder executer', 'error').error(message, ...args);
