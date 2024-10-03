import { provider as emailProvider } from './email-provider';
import { provider as telegramProvider } from './telegram-provider';

class NotificationProvider {
  sendNotification(isSuccessful: boolean, attempt: number, error?: Error) {
    emailProvider.sendNotification(isSuccessful, attempt, error);
    telegramProvider.sendNotification(isSuccessful, attempt, error);
  }
}

const notificationProvider = new NotificationProvider();
export default notificationProvider;
