
import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { GeminiCore } from '../gemini_core';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { z } from 'zod';
import { logger } from '../logger';

// Mock the GoogleGenerativeAI library
jest.mock('@google/generative-ai');
jest.mock('../logger');

describe('GeminiCore', () => {
  const mockApiKey = 'test-api-key';
  const mockGenerateContent = jest.fn();
  const mockGetGenerativeModel = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    // Setup the mock for GoogleGenerativeAI
    (GoogleGenerativeAI as jest.Mock).mockImplementation(() => ({
      getGenerativeModel: mockGetGenerativeModel.mockReturnValue({
        generateContent: mockGenerateContent,
      }),
    }));

    mockGenerateContent.mockResolvedValue({
      response: {
        text: () => '{"foo": "bar"}',
      },
    });

    // Mock localStorage for API key
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: jest.fn((key) => {
          if (key === 'gemini-api-key') return JSON.stringify(mockApiKey);
          return null;
        }),
      },
      writable: true,
    });
  });

  describe('Initialization', () => {
    it('should initialize with an API key from constructor', () => {
      new GeminiCore('custom-key');
      expect(GoogleGenerativeAI).toHaveBeenCalledWith('custom-key');
    });

    it('should initialize with an API key from localStorage if not provided in constructor', () => {
      new GeminiCore();
      expect(GoogleGenerativeAI).toHaveBeenCalledWith(mockApiKey);
    });

    it('should throw error if no API key is available', () => {
        // Mock localStorage to return null
        Object.defineProperty(window, 'localStorage', {
            value: {
              getItem: jest.fn(() => null),
            },
            writable: true,
          });

        // Also ensure process.env is not providing it (mocked in jest.setup.js)
        const originalEnv = process.env;
        process.env = { ...originalEnv, VITE_GEMINI_API_KEY: '', GEMINI_API_KEY: '' };

        expect(() => new GeminiCore()).toThrow('API Key is missing');

        process.env = originalEnv;
    });
  });

  describe('generateContent', () => {
    it('should generate content successfully', async () => {
      const gemini = new GeminiCore(mockApiKey);
      const result = await gemini.generateContent('test prompt');

      expect(result).toEqual({ success: true, data: '{"foo": "bar"}' });
      expect(mockGenerateContent).toHaveBeenCalledWith('test prompt');
    });

    it('should retry on 429 errors', async () => {
      const gemini = new GeminiCore(mockApiKey);

      // Fail once with 429, then succeed
      mockGenerateContent
        .mockRejectedValueOnce({ status: 429 })
        .mockResolvedValueOnce({
          response: { text: () => 'success' },
        });

      const result = await gemini.generateContent('test prompt');

      expect(result).toEqual({ success: true, data: 'success' });
      expect(mockGenerateContent).toHaveBeenCalledTimes(2);
    });

    it('should return error after max retries', async () => {
        const gemini = new GeminiCore(mockApiKey);

        // Always fail with 429
        mockGenerateContent.mockRejectedValue({ status: 429 });

        jest.useFakeTimers();

        const promise = gemini.generateContent('test prompt');

        // Advance timers for each retry
        // APP_CONFIG.AI.MAX_RETRIES is 3.
        for (let i = 0; i < 3; i++) {
            await jest.advanceTimersByTimeAsync(10000); // Advance enough time
        }

        const result = await promise;

        expect(result.success).toBe(false);
        if (!result.success) { // type guard
            // The public message is masked, but we verify we caught the retry failure
            expect(result.message).toContain('An unexpected error occurred');
        }

        jest.useRealTimers();
    });

    it('should handle non-retriable errors immediately', async () => {
        const gemini = new GeminiCore(mockApiKey);
        mockGenerateContent.mockRejectedValue({ status: 400, message: 'Bad Request' });

        const result = await gemini.generateContent('test prompt');

        expect(result.success).toBe(false);
        expect(mockGenerateContent).toHaveBeenCalledTimes(1);
    });
  });

  describe('generateJSON', () => {
      it('should parse valid JSON response', async () => {
          const gemini = new GeminiCore(mockApiKey);
          const schema = z.object({ foo: z.string() });

          const result = await gemini.generateJSON('test prompt', schema);

          expect(result).toEqual({ success: true, data: { foo: 'bar' } });
      });

      it('should handle invalid JSON syntax', async () => {
          const gemini = new GeminiCore(mockApiKey);
          mockGenerateContent.mockResolvedValue({
              response: { text: () => 'invalid json' },
          });

          const result = await gemini.generateJSON('test prompt');

          expect(result.success).toBe(false);
          if (!result.success) {
            // The public message is masked, so we check the logger
            expect(logger.error).toHaveBeenCalledWith(
              'GeminiCore.generateJSON',
              'Failed to extract or parse JSON from Gemini response.',
              expect.anything()
            );
          }
      });

      it('should handle schema validation failure', async () => {
        const gemini = new GeminiCore(mockApiKey);
        const schema = z.object({ baz: z.string() }); // Expecting 'baz', getting 'foo'

        const result = await gemini.generateJSON('test prompt', schema);

        expect(result.success).toBe(false);
        if (!result.success) {
           // The public message is masked, so we check the logger
           expect(logger.error).toHaveBeenCalledWith(
             'GeminiCore.generateJSON',
             'Zod validation failed.',
             expect.anything()
           );
        }
    });
  });

  describe('generateJSONWithRepair', () => {
    it('should return valid data on first try', async () => {
        const gemini = new GeminiCore(mockApiKey);
        const schema = z.object({ foo: z.string() });

        const result = await gemini.generateJSONWithRepair('test prompt', schema);

        expect(result).toEqual({ success: true, data: { foo: 'bar' } });
        expect(mockGenerateContent).toHaveBeenCalledTimes(1);
    });

    it('should attempt repair if schema validation fails', async () => {
        const gemini = new GeminiCore(mockApiKey);
        const schema = z.object({ baz: z.string() });

        // First attempt returns invalid data for schema
        mockGenerateContent
            .mockResolvedValueOnce({
                response: { text: () => '{"foo": "bar"}' },
            })
            // Second attempt (repair) returns correct data
            .mockResolvedValueOnce({
                response: { text: () => '{"baz": "qux"}' },
            });

        const result = await gemini.generateJSONWithRepair('test prompt', schema);

        expect(result).toEqual({ success: true, data: { baz: 'qux' } });
        expect(mockGenerateContent).toHaveBeenCalledTimes(2);

        // Verify the second call contains the repair prompt
        const secondCallArg = mockGenerateContent.mock.calls[1][0];
        expect(secondCallArg).toContain('You previously generated a JSON response that failed validation');
    });
  });
});
