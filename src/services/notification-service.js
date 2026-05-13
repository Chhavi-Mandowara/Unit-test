/**
 * Notification service for sending reminders
 */
class NotificationService {
  constructor(logger) {
    this.logger = logger;
    this.sentNotifications = [];
  }

  async sendReminder(todoTitle, userEmail) {
    try {
      const notification = {
        id: this._generateId(),
        type: 'reminder',
        todoTitle,
        userEmail,
        sentAt: new Date().toISOString(),
        status: 'sent'
      };

      await this._deliverNotification(notification);

      this.sentNotifications.push(notification);
      this.logger.info('Reminder notification sent', {
        todoTitle,
        userEmail,
        notificationId: notification.id
      });

      return notification;
    } catch (error) {
      this.logger.error('Failed to send reminder notification', error, { todoTitle, userEmail });
      throw error;
    }
  }

  async sendDailyDigest(userEmail, todoCount) {
    const notification = {
      id: this._generateId(),
      type: 'daily_digest',
      userEmail,
      todoCount,
      sentAt: new Date().toISOString(),
      status: 'sent'
    };

    await this._deliverNotification(notification);
    this.sentNotifications.push(notification);

    this.logger.info('Daily digest sent', { userEmail, todoCount });
    return notification;
  }

  async _deliverNotification(notification) {
    return new Promise(resolve => {
      setTimeout(() => resolve(), 10);
    });
  }

  _generateId() {
    return `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  getSentNotifications() {
    return [...this.sentNotifications];
  }

  clear() {
    this.sentNotifications = [];
  }
}

module.exports = NotificationService;
