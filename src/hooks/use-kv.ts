import { useState, useEffect, useCallback } from 'react';

// Custom event for same-tab synchronization
const dispatchStorageEvent = (key: string, newValue: string | null) => {
  window.dispatchEvent(new StorageEvent('storage', { key, newValue }));
  window.dispatchEvent(new CustomEvent('local-storage-change', { detail: { key, newValue } }));
};

export function useKV<T>(key: string, initialValue: T): [T, (value: T | ((val: T) => T)) => void] {
  // Helper to read from local storage
  const readValue = useCallback((): T => {
    if (typeof window === 'undefined') {
      return initialValue;
    }

    try {
      const item = window.localStorage.getItem(key);
      return item ? (JSON.parse(item) as T) : initialValue;
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  }, [key, initialValue]);

  const [storedValue, setStoredValue] = useState<T>(readValue);

  const setValue = useCallback((value: T | ((val: T) => T)) => {
    try {
      const valueToStore =
        value instanceof Function ? value(storedValue) : value;

      setStoredValue(valueToStore);

      if (typeof window !== 'undefined') {
        const stringValue = JSON.stringify(valueToStore);
        window.localStorage.setItem(key, stringValue);
        dispatchStorageEvent(key, stringValue);
      }
    } catch (error) {
      console.warn(`Error setting localStorage key "${key}":`, error);
    }
  }, [key, storedValue]);

  useEffect(() => {
    const handleStorageChange = (event: StorageEvent | CustomEvent) => {
      const eventKey = event instanceof StorageEvent ? event.key : (event as CustomEvent).detail.key;

      if (eventKey === key) {
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
