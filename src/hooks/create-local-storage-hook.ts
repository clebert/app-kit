import * as hooks from 'preact/hooks';

export type LocalStorageHook = () => [
  string | undefined,
  hooks.StateUpdater<string | undefined>
];

export function createLocalStorageHook(key: string): LocalStorageHook {
  return () => {
    const state = hooks.useState(() => {
      const item = localStorage.getItem(key);

      return item !== null ? item : undefined;
    });

    const value = state[0];

    hooks.useEffect(() => {
      if (value !== undefined) {
        localStorage.setItem(key, value);
      } else {
        localStorage.removeItem(key);
      }
    }, [value]);

    return state;
  };
}
