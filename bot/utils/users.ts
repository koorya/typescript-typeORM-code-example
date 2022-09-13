import { ListUsersResult, UserRecord } from 'firebase-admin/lib/auth';
import admin from 'firebase-admin';
import { getRepository } from '../connections';
import { TelegramUserData } from '@entity/telegram/TelegramUserData.entity';
import { UserRole } from 'bot/const';

export const getRosnovaUserByPhone = async (
  phone: string,
): Promise<UserRecord | null> =>
  admin
    .auth()
    .getUserByPhoneNumber(`+${phone}`)
    .catch((error) => {
      if (error.errorInfo.code === 'auth/user-not-found') {
        return null;
      } else {
        throw error;
      }
    });

const listRosnovaUsersByUids = async (uid: string[]): Promise<UserRecord[]> => {
  const uidCopy = [...uid];
  const res: UserRecord[] = [];
  while (uidCopy.length) {
    res.push(...(await admin
      .auth()
      .getUsers(uidCopy.splice(0, 90).map(uid => ({ uid })))).users)
  }
  return res;
}
export const getUserObjectsByRosnovaUidList = async (uid: string[]): Promise<{ [key in string]: string[] }> => {
  const uidObjectsRelations = (await listRosnovaUsersByUids(uid))
    .reduce((acc, user) => {
      acc[user.uid] = user.customClaims['objects']?.map(({ key }: { key: string }) => key) || [];
      return acc;
    }, {});
  return uidObjectsRelations;
}

export const getUserObjectsByRosnovaUid = async (uid: string): Promise<string[]> => (await admin
  .auth()
  .getUser(uid))
  .customClaims['objects']
  ?.map(({ key }: { key: string }) => key);

export const isAdminChat = async (telegramChatId: string): Promise<boolean> => {
  const eventSubscriptionRepository = getRepository(TelegramUserData);
  const userRole = (await eventSubscriptionRepository.findOne({ where: { telegramChatId } }))?.userRole;
  return userRole === UserRole.ADMIN;
}

export const getUserObjectsByTelegramChatId = async (telegramChatId: string): Promise<string[]> => {
  const eventSubscriptionRepository = getRepository(TelegramUserData);
  const rosnovaUserId = (await eventSubscriptionRepository.findOne({ where: { telegramChatId } }))?.rosnovaUserId;
  const userObjects = await getUserObjectsByRosnovaUid(rosnovaUserId);
  return userObjects;
}

export const getUserObjectsByTelegramChatIdCached = async (telegramChatId: string, userObjectsByUidMap: { [key in string]: string[] }): Promise<string[]> => {
  const eventSubscriptionRepository = getRepository(TelegramUserData);
  const rosnovaUserId = (await eventSubscriptionRepository.findOne({ where: { telegramChatId } }))?.rosnovaUserId;
  const userObjects = userObjectsByUidMap[rosnovaUserId] || [];
  return userObjects;
}

export const getRosnovaUserIdList = async (): Promise<string[]> => {
  const eventSubscriptionRepository = getRepository(TelegramUserData);
  const rosnovaUserId = (await eventSubscriptionRepository.find()).map(({ rosnovaUserId }) => rosnovaUserId);
  return rosnovaUserId;
}


export const getLocalUserByChatId = async (chatId: number) => {
  const telegramUserDataRepository = getRepository(TelegramUserData);
  return telegramUserDataRepository.findOne({
    where: { telegramChatId: chatId.toString() },
  });
};

export const createLocalUser = async (userData: TelegramUserData) => {
  const telegramUserDataRepository = getRepository(TelegramUserData);
  const user = telegramUserDataRepository.create(userData);
  await telegramUserDataRepository.save(user);
};
