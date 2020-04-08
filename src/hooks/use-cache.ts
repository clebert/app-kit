import * as hooks from 'preact/hooks';

export interface Cache<TData> {
  readonly data: TData;

  store(newData: TData): void;
}

export function useCache<TData>(
  key: string | undefined,
  fallbackData: TData
): Cache<TData> {
  const rawValue = hooks.useMemo(
    () => (key && localStorage.getItem(key)) || undefined,
    [key]
  );

  const data = hooks.useMemo(() => {
    if (rawValue) {
      try {
        return JSON.parse(rawValue) as TData;
      } catch (error) {
        console.error('Unable to read cached data.', error);
      }
    }

    return fallbackData;
  }, [rawValue]);

  const store = hooks.useCallback(
    (newData: TData) => {
      if (key) {
        try {
          localStorage.setItem(key, JSON.stringify(newData));
        } catch (error) {
          console.error('Unable to store cached data.', error);
        }
      }
    },
    [key]
  );

  return hooks.useMemo(() => ({data, store}), [data, store]);
}
