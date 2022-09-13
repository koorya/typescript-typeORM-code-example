import { EventDataHasLink } from "@alert-service/events/dto/events.dto";
import { EventTypeEnum } from "@alert-service/types";
import { Event } from "@orm/entity/event/Event.entity";
import { formatDate, formatTimeOnly } from "worker/utils";


export const new_line = "%0A";

export const getAdminLink = ({ data: { link } }: EventDataHasLink) => {
	const url = `https://console.firebase.google.com/u/0/project/rosnova54/firestore/data/~2F${link.replace(/\//g, '~2F')}`;
	return `<a href="${url}">Firebase</a>`;
}

export const getExtraMessageTextByEvent = (event: Event, isAdmin: boolean = false) => {

	if (event.data.type === EventTypeEnum.ZERO_TRANSACTION) {

		const eventData = event.data.data;
		return `
		<b>Время транзакции:</b> ${formatDate(new Date(eventData.start_time))} - ${formatTimeOnly(new Date(eventData.time))}
		<b>Объем / Масса / Плотность:</b> ${eventData.liters} л / ${eventData.weight || '--'} кг /  ${eventData.density || '--'}
		<b>Подрядчик:</b> ${eventData?.to.company} 
		<b>Модель ТС:</b> ${eventData?.to.carmarka}
		<b>Номер ТС:</b> ${eventData?.to.carnumber}
		<b>Выдал:</b> ${eventData.isAtz ? `АТЗ` : 'ТПЗ'} ${eventData.name}
		${isAdmin ? getAdminLink(event.data) : ''}
		`.replace(/\n\s+/g, '\n');
	} else if (event.data.type === EventTypeEnum.UNCLOSED_RACE) {
		return isAdmin ? getAdminLink(event.data) : '';
	}
	return '.';
}