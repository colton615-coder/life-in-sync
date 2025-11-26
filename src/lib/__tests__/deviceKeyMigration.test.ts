/** @jest-environment jsdom */
import { describe, it, expect, beforeEach } from '@jest/globals';
import { getDeviceKey } from '../crypto';

describe('getDeviceKey migration', () => {
  const oldKey = "jestjesten-US"

  beforeEach(() => {
    // Mock localStorage for jsdom environment
    const store: { [key: string]: string } = {};
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: jest.fn((key: string) => store[key] || null),
        setItem: jest.fn((key: string, value: string) => {
          store[key] = value.toString();
        }),
        removeItem: jest.fn((key: string) => {
            delete store[key];
        }),
        clear: jest.fn(() => {
          Object.keys(store).forEach(key => {
            delete store[key];
          });
        })
      },
      writable: true
    });

    // Mock navigator for jsdom environment
    Object.defineProperty(window.navigator, 'userAgent', {
      value: 'jest',
      writable: true,
    });
    Object.defineProperty(window.navigator, 'platform', {
      value: 'jest',
      writable: true,
    });
    Object.defineProperty(window.navigator, 'language', {
      value: 'en-US',
      writable: true,
    });
  });

  it('should migrate the old device key to localStorage', () => {
    // For an existing user, the key should be derived from navigator properties
    // and then stored in localStorage.
    const key = getDeviceKey();
    expect(key).toBe(oldKey);
    expect(localStorage.setItem).toHaveBeenCalledWith('deviceKey', oldKey);
  });

  it('should generate a new key for a new user', () => {
    // For a new user, a random UUID should be generated and stored.
    Object.defineProperty(window, 'navigator', {
        value: {},
        writable: true
    });
    const key = getDeviceKey();
    expect(key).not.toBe(oldKey);
    expect(key.length).toBe(36); // UUID length
    expect(localStorage.setItem).toHaveBeenCalledWith('deviceKey', key);
  });

  it('should return the stored key for an already-migrated user', () => {
    // For a user who has already been migrated, the stored key should be returned.
    const storedKey = 'my-stored-key';
    (localStorage.getItem as jest.Mock).mockReturnValue(storedKey);
    const key = getDeviceKey();
    expect(key).toBe(storedKey);
    expect(localStorage.setItem).not.toHaveBeenCalled();
  });
});
