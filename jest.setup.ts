import type React from "react";

jest.mock("@react-native-async-storage/async-storage", () => {
  const store = new Map<string, string>();
  return {
    __esModule: true,
    default: {
      getItem: jest.fn((key: string) => Promise.resolve(store.get(key) ?? null)),
      setItem: jest.fn((key: string, value: string) => {
        store.set(key, value);
        return Promise.resolve();
      }),
      removeItem: jest.fn((key: string) => {
        store.delete(key);
        return Promise.resolve();
      }),
      clear: jest.fn(() => {
        store.clear();
        return Promise.resolve();
      })
    }
  };
});

jest.mock("expo-router", () => ({
  Link: ({ children }: { children: React.ReactNode }) => children,
  Redirect: () => null,
  Stack: {
    Screen: () => null
  },
  Tabs: {
    Screen: () => null
  },
  router: {
    replace: jest.fn(),
    push: jest.fn(),
    back: jest.fn()
  },
  useLocalSearchParams: jest.fn(() => ({}))
}));
