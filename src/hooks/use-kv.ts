import { useState, useEffect, useCallback } from 'react';

// Custom event for same-tab synchronization
const dispatchStorageEvent = (key: string, newValue: string | null) => {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new StorageEvent('storage', { key, newValue }));
    window.dispatchEvent(new CustomEvent('local-storage-change', { detail: { key, newValue } }));
  }
};

/**
 * A robust hook for managing state persisted in localStorage.
 * Features:
 * - Type safety with generics
 * - Synchronization across tabs (StorageEvent)
 * - Synchronization within the same tab/window (CustomEvent)
 * - Error handling for JSON parsing/stringifying
 * - SSR safe
 *
 * @param key The key to store in localStorage
 * @param initialValue The default value if no data exists
 * @returns [value, setValue] tuple
 */
export function useKV<T>(key: string, initialValue: T): [T, (value: T | ((val: T) => T)) => void] {
  // Helper to read from local storage safely
  const readValue = useCallback((): T => {
    if (typeof window === 'undefined') {
      return initialValue;
    }

    try {
      const item = window.localStorage.getItem(key);
      if (!item) return initialValue;

      // Handle pure strings specially if T is string, but JSON.parse handles quoted strings.
      // However, if the value was stored without quotes (legacy), JSON.parse might fail or return numbers.
      // Assuming standardized useKV usage, it's always JSON stringified.
      return JSON.parse(item) as T;
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  }, [key, initialValue]);

  // State to store our value
  // Pass a function to useState so logic runs only once
  const [storedValue, setStoredValue] = useState<T>(readValue);

  // Return a wrapped version of useState's setter function that ...
  // ... persists the new value to localStorage.
  const setValue = useCallback((value: T | ((val: T) => T)) => {
    try {
      // Allow value to be a function so we have same API as useState
      const valueToStore = value instanceof Function ? value(storedValue) : value;

      // Save state
      setStoredValue(valueToStore);

      // Save to local storage
      if (typeof window !== 'undefined') {
        const stringValue = JSON.stringify(valueToStore);
        window.localStorage.setItem(key, stringValue);

        // Dispatch events for sync
        dispatchStorageEvent(key, stringValue);
      }
    } catch (error) {
      console.warn(`Error setting localStorage key "${key}":`, error);
    }
  }, [key, storedValue]);

  // Effect to listen for changes from other tabs/components
  useEffect(() => {
    const handleStorageChange = (event: StorageEvent | CustomEvent) => {
      const eventKey = event instanceof StorageEvent ? event.key : (event as CustomEvent).detail?.key;

      if (eventKey === key) {
        // When the key changes, read the new value
        // We verify if the new value is actually different to avoid loops,
        // but setStoredValue handles strict equality check natively.
        setStoredValue(readValue());
      }
    };

    // Listen to standard storage event (cross-tab)
    window.addEventListener('storage', handleStorageChange as EventListener);
    // Listen to custom event (same-tab)
    window.addEventListener('local-storage-change', handleStorageChange as EventListener);

    return () => {
      window.removeEventListener('storage', handleStorageChange as EventListener);
      window.removeEventListener('local-storage-change', handleStorageChange as EventListener);
    };
  }, [key, readValue]);

  return [storedValue, setValue];
}
