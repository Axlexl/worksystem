import { useState } from "react";

/**
 * Drop-in replacement for useState that persists to localStorage.
 * Falls back to initialValue if nothing is stored yet.
 */
export function useLocalStorage(key, initialValue) {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item !== null ? JSON.parse(item) : initialValue;
    } catch {
      return initialValue;
    }
  });

  const setValue = (value) => {
    try {
      // Allow functional updates just like useState
      const valueToStore =
        typeof value === "function" ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.warn(`useLocalStorage: could not save key "${key}"`, error);
    }
  };

  return [storedValue, setValue];
}
