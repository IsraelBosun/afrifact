/** Daily facts, scheduled on the device. Nothing here talks to a server. */

export {
  cancelDailyFacts,
  EVENING_HOUR,
  MORNING_HOUR,
  requestPermission,
  scheduledCount,
  scheduleDailyFacts,
} from './daily';
export { ASK_DELAY_MS, noteAppOpen, shouldOfferNotifications } from './prompt';
export {
  loadNotificationSetting,
  notificationsEnabled,
  setNotificationsEnabled,
  syncNotifications,
  useNotificationsEnabled,
} from './setting';
