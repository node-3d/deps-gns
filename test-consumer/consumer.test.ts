import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import test from 'node:test';

import '@node-3d/deps-gns';

const require = createRequire(import.meta.url);
const consumer = require('./build/Release/consumer.node') as { probe: () => boolean };

test('links and loads the GNS candidate', () => assert.equal(consumer.probe(), true));
