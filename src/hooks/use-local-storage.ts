import * as hooks from 'preact/hooks';

export function useLocalStorage(
  key: string
): [string | undefined, hooks.StateUpdater<string | undefined>] {
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
}
