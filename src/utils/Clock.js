/**
 * Clock utility for getting current time - makes testing time-dependent code easier
 */
class Clock {
  now() {
    return new Date();
  }

  timestamp() {
    return Date.now();
  }
}

module.exports = Clock;
