const NotificationService = require('./notification-service');

/**
 * Demo: async boundary + collaborator (logger). Good test waits for the
 * promise and checks outcomes, not internal delay implementation.
 */
describe('notification-service', () => {
  let logger;
  let notifications;

  beforeEach(() => {
    logger = { info: jest.fn(), error: jest.fn() };
    notifications = new NotificationService(logger);
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('sendReminder resolves with a sent reminder payload', async () => {
    const result = await notifications.sendReminder('Buy milk', 'user@example.com');

    expect(result.type).toBe('reminder');
    expect(result.todoTitle).toBe('Buy milk');
    expect(result.userEmail).toBe('user@example.com');
    expect(result.status).toBe('sent');
    expect(logger.info).toHaveBeenCalledWith(
      'Reminder notification sent',
      expect.objectContaining({
        todoTitle: 'Buy milk',
        userEmail: 'user@example.com'
      })
    );
  });

  it('sendDailyDigest records todo count on the notification', async () => {
    const result = await notifications.sendDailyDigest('user@example.com', 7);
    expect(result.type).toBe('daily_digest');
    expect(result.todoCount).toBe(7);
    expect(logger.info).toHaveBeenCalledWith('Daily digest sent', {
      userEmail: 'user@example.com',
      todoCount: 7
    });
  });
});
