/**
 * Analytics service for tracking events
 */
class AnalyticsService {
  constructor(logger) {
    this.logger = logger;
    this.events = [];
  }

  track(eventName, properties = {}) {
    const event = {
      name: eventName,
      properties,
      timestamp: Date.now(),
      sessionId: this._getSessionId()
    };

    this.events.push(event);
    this.logger.info(`Analytics event tracked: ${eventName}`, { properties });

    this._sendToAnalyticsPlatform(event);
  }

  _sendToAnalyticsPlatform(event) {
    // Simulate external API call
  }

  _getSessionId() {
    return 'session-123';
  }

  getEvents() {
    return [...this.events];
  }

  clear() {
    this.events = [];
  }
}

module.exports = AnalyticsService;
