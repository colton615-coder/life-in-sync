
import { jest, describe, beforeEach, test, expect } from '@jest/globals';
import { z } from 'zod';

// Hoisted mock
const mockGenerateContent = jest.fn();
const mockGetGenerativeModel = jest.fn().mockReturnValue({
  generateContent: mockGenerateContent
});
const mockGoogleGenerativeAI = jest.fn().mockImplementation(() => ({
  getGenerativeModel: mockGetGenerativeModel
}));

// Unstable ESM mocking with Jest can be tricky.
// We use unstable_mockModule if using full ESM, but here we are using ts-jest with CJS compat usually.
// However, since the file is .ts and we use `import`, let's try the standard jest.mock hoisting.
jest.mock('@google/generative-ai', () => {
  return {
    GoogleGenerativeAI: mockGoogleGenerativeAI
  };
});

// Import AFTER mocking
import { GeminiCore } from '../gemini_core';
import { callAIWithRetry } from '../../lib/ai-utils';

describe('Nervous System Verification', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.GEMINI_API_KEY = 'test-key';

    // Silence console errors for expected failure paths
    jest.spyOn(console, 'error').mockImplementation(() => {});
    jest.spyOn(console, 'warn').mockImplementation(() => {});
    jest.spyOn(console, 'log').mockImplementation(() => {});
  });

  test('GeminiCore retries on 429', async () => {
    const core = new GeminiCore();

    // First call fails with 429, second succeeds
    mockGenerateContent
      .mockRejectedValueOnce({ status: 429 })
      .mockResolvedValueOnce({
        response: { text: () => 'Success' }
      });

    const result = await core.generateContent('test prompt');
    expect(result).toEqual({ success: true, data: 'Success' });
    expect(mockGenerateContent).toHaveBeenCalledTimes(2);
  });

  test('GeminiCore generateJSON parses valid JSON', async () => {
    const core = new GeminiCore();
    mockGenerateContent.mockResolvedValue({
      response: { text: () => '```json\n{"foo": "bar"}\n```' }
    });

    const schema = z.object({ foo: z.string() });
    const result = await core.generateJSON('prompt', schema);

    expect(result).toEqual({ success: true, data: { foo: 'bar' } });
  });

  test('ai-utils delegates to GeminiCore', async () => {
    // Note: ai-utils.ts instantiates GeminiCore at the module level.
    // Because we mocked @google/generative-ai BEFORE importing ai-utils (via imports above),
    // the GeminiCore instance inside ai-utils should use the mocked SDK.

    mockGenerateContent.mockResolvedValue({
      response: { text: () => 'Delegated Response' }
    });

    const result = await callAIWithRetry('test');
    expect(result).toEqual({ success: true, data: 'Delegated Response' });
  });
});
