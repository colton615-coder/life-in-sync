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
    // Use Node's webcrypto implementation (available in Node 15+)
    // This maps crypto.subtle.encrypt/decrypt correctly
    ...crypto.webcrypto,

    // Add randomUUID
    randomUUID: crypto.randomUUID,

    // Fallback for getRandomValues if not fully covered by the spread above
    getRandomValues: (buffer) => {
      return crypto.webcrypto.getRandomValues(buffer);
    }
  }
});

// 3. Polyfill btoa and atob
global.btoa = (str) => Buffer.from(str, 'binary').toString('base64');
global.atob = (b64) => Buffer.from(b64, 'base64').toString('binary');
