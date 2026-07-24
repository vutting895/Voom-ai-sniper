import assert from 'node:assert/strict';
import test from 'node:test';

import { APP_NAME, SUPPORTED_BROKERS, createHealthStatus } from './index.js';

test('creates a healthy status payload', () => {
  assert.deepEqual(createHealthStatus('api'), { status: 'ok', service: 'api' });
});

test('exports product and supported market-data brokers', () => {
  assert.equal(APP_NAME, 'Voom AI Sniper');
  assert.deepEqual(SUPPORTED_BROKERS, ['mt5', 'interactive_brokers', 'binance']);
});
