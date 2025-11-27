
// Mock GeminiCore to prevent "import.meta" syntax error during test execution
jest.mock('../../services/gemini_core', () => {
  return {
    GeminiCore: class {
      generateContent() { return Promise.resolve({ success: true, data: '' }); }
    }
  };
});

import { cleanAndParseJSON } from '../ai-utils';

describe('cleanAndParseJSON', () => {
  it('parses valid simple JSON', () => {
    const input = '{"key": "value"}';
    const result = cleanAndParseJSON(input);
    expect(result).toEqual({ key: 'value' });
  });

  it('parses JSON wrapped in markdown code blocks', () => {
    const input = '```json\n{"key": "value"}\n```';
    const result = cleanAndParseJSON(input);
    expect(result).toEqual({ key: 'value' });
  });

  it('parses JSON with extra text before and after', () => {
    const input = 'Here is your JSON response: {"data": 123} Hope this helps.';
    const result = cleanAndParseJSON(input);
    expect(result).toEqual({ data: 123 });
  });

  it('parses JSON with newlines inside', () => {
    const input = `
      {
        "items": [
          1,
          2
        ]
      }
    `;
    const result = cleanAndParseJSON(input);
    expect(result).toEqual({ items: [1, 2] });
  });

  it('captures from first { to last } when multiple braces exist', () => {
    // This tests the greedy nature: { ... { ... } ... }
    const input = '{"outer": {"inner": "value"}}';
    const result = cleanAndParseJSON(input);
    expect(result).toEqual({ outer: { inner: 'value' } });
  });

  it('returns null if no curly braces exist', () => {
    const input = 'Just some plain text response without JSON.';
    const result = cleanAndParseJSON(input);
    expect(result).toBeNull();
  });

  it('returns null if JSON is malformed inside the braces', () => {
    const input = '{"key": "value" - broken }';
    // The regex captures {"key": "value" - broken }, JSON.parse fails -> returns null
    const result = cleanAndParseJSON(input);
    expect(result).toBeNull();
  });

  it('returns null for empty string', () => {
    const result = cleanAndParseJSON('');
    expect(result).toBeNull();
  });

  it('handles nested objects correctly', () => {
     const input = 'Prefix text {"a": 1, "b": {"c": 2}} Suffix text';
     const result = cleanAndParseJSON(input);
     expect(result).toEqual({a: 1, b: {c: 2}});
  });

  // Edge case: Multiple separate JSON objects. User confirmed "first { to last }".
  // This results in invalid JSON if they are siblings, but valid if nested.
  // Example: {a:1} text {b:2} -> "{a:1} text {b:2}" -> Invalid JSON -> null
  it('returns null for multiple sibling JSON objects (invalid structure)', () => {
    const input = 'Here is one: {"a": 1} and here is two: {"b": 2}';
    const result = cleanAndParseJSON(input);
    expect(result).toBeNull();
  });
});
