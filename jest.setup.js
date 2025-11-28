// jest.setup.js or setupTests.ts

// 1. Polyfill TextEncoder/TextDecoder (Required for Web Crypto)
const { TextEncoder, TextDecoder } = require('util');
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

// 2. Polyfill Web Crypto API using Node's native implementation
const crypto = require('crypto');

// Check if the current environment already has a crypto object (JSDOM does, but it's incomplete)
Object.defineProperty(global, 'crypto', {
  value: {
    // Safe spread for webcrypto
    ...(crypto.webcrypto || {}),

    // Add randomUUID
    randomUUID: crypto.randomUUID || (() => "test-uuid-" + Math.random()),

    // Fallback for getRandomValues if not fully covered by the spread above
    getRandomValues: (buffer) => {
      if (crypto.webcrypto && crypto.webcrypto.getRandomValues) {
          return crypto.webcrypto.getRandomValues(buffer);
      }
      return crypto.randomFillSync(buffer);
    }
  }
});

// 3. Polyfill btoa and atob
global.btoa = (str) => Buffer.from(str, 'binary').toString('base64');
global.atob = (b64) => Buffer.from(b64, 'base64').toString('binary');
