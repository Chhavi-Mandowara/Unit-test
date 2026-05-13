const AnalyticsService = require('./analytics-service');

/**
 * Demo: track() is a side effect — we stub the logger and assert behavior
 * (event stored + logger called), not private helpers.
 */
describe('analytics-service', () => {
  let logger;
  let analytics;

  beforeEach(() => {
    logger = { info: jest.fn() };
    analytics = new AnalyticsService(logger);
  });

  it('stores an event and logs a single info line', () => {
    analytics.track('page_view', { path: '/todos' });

    const events = analytics.getEvents();
    expect(events).toHaveLength(1);
    expect(events[0].name).toBe('page_view');
    expect(events[0].properties).toEqual({ path: '/todos' });
    expect(events[0].sessionId).toBe('session-123');

    expect(logger.info).toHaveBeenCalledWith(
      'Analytics event tracked: page_view',
      { properties: { path: '/todos' } }
    );
  });

  it('clear resets events for the next demo scenario', () => {
    analytics.track('a', {});
    analytics.clear();
    expect(analytics.getEvents()).toHaveLength(0);
  });
});
