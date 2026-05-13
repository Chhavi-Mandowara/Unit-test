const Logger = require('./logger');

/**
 * Demo: asserting on exact console strings is brittle; here we only check
 * in-memory log entries (good for unit tests of collaborators).
 */
describe('logger', () => {
  let logger;

  beforeEach(() => {
    logger = new Logger();
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
    jest.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('records an info entry with message and context', () => {
    logger.info('User signed in', { userId: 42 });

    const logs = logger.getLogs();
    expect(logs).toHaveLength(1);
    expect(logs[0].level).toBe('info');
    expect(logs[0].message).toBe('User signed in');
    expect(logs[0].context).toEqual({ userId: 42 });
  });

  it('clear removes all buffered entries', () => {
    logger.info('a');
    logger.warn('b');
    logger.clear();
    expect(logger.getLogs()).toHaveLength(0);
  });
});
