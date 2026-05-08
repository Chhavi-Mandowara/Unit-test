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
    
    // Simulate sending to external service
    this._sendToAnalyticsPlatform(event);
  }

  _sendToAnalyticsPlatform(event) {
    // Simulate external API call
    // In real app, this would be HTTP request to analytics service
  }

  _getSessionId() {
    return 'session-123'; // Simplified for demo
  }

  getEvents() {
    return [...this.events];
  }

  clear() {
    this.events = [];
  }
}

module.exports = AnalyticsService;