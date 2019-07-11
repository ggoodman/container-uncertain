//@ts-check
'use strict';

const Assert = require('assert');

const STARTUP_MAX_DURATION = 10000;
const FAILURE_MODE_FREQUENCIES = {
  arrythmea: 0.05,
  heartFailure: 0.05,
  startupException: 0.1,
  startupDelayedException: 0.1,
};
const FAILURE_INCREASE_FACTOR = 1.05;

process.on('uncaughtException', err => {
  console.error(err);
  process.exit(1);
});

process.on('SIGINT', () => {
  process.exit(0);
});

process.on('SIGTERM', () => {
  setTimeout(() => {
    process.exit();
  }, 5000);
});

Assert.ok(process.env.PORT, 'The PORT environment variable is required');
Assert.ok(
  process.env.HEARTBEAT_INTERVAL,
  'The HEARTBEAT_INTERVAL environment variable is required'
);

// Simulate occasional startup exceptions
if (Math.random() < FAILURE_MODE_FREQUENCIES.startupException) {
  throw new Error("I've fallen and I can't get up!");
}

setTimeout(() => {
  if (Math.random() < FAILURE_MODE_FREQUENCIES.startupDelayedException) {
    throw new Error('To be or not to be?');
  }

  process.stdout.write('ready\n');

  // Start the heartbeat
  setInterval(() => {
    // Periodically send a heart beat over standard output to let the pool
    // know I'm still alive... Unless, of course, I'm not, then don't.
    if (Math.random() >= FAILURE_MODE_FREQUENCIES.arrythmea) {
      process.stdout.write('thump\n');

      // Make things more likely to fail over time
      FAILURE_MODE_FREQUENCIES.arrythmea *= FAILURE_INCREASE_FACTOR;
    }

    if (Math.random() < FAILURE_MODE_FREQUENCIES.heartFailure) {
      throw new Error('Oh woe is me!');
    }

    // Make things more likely to fail over time
    FAILURE_MODE_FREQUENCIES.heartFailure *= FAILURE_INCREASE_FACTOR;
  }, +process.env.HEARTBEAT_INTERVAL);
}, Math.random() * STARTUP_MAX_DURATION);
