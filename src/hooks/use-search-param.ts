import * as hooks from 'preact/hooks';
import {HistoryContext} from '../contexts/history-context';
import {useLocation} from './use-location';

export function useSearchParam(
  paramName: string
): [string | undefined, (value: string | undefined) => void] {
  const {search} = useLocation();

  const nativeParamValue = hooks.useMemo(
    () => new URLSearchParams(search).get(paramName),
    [paramName, search]
  );

  const paramValue = nativeParamValue !== null ? nativeParamValue : undefined;
  const history = hooks.useContext(HistoryContext);

  const setParamValue = hooks.useCallback(
    (newParamValue: string | undefined) => {
      const {
        pathname: previousPathname,
        search: previousSearch,
      } = history.location;

      const searchParams = new URLSearchParams(previousSearch);

      if (newParamValue === undefined) {
        searchParams.delete(paramName);
      } else {
        searchParams.set(paramName, newParamValue);
      }

      const newSearch = searchParams.toString();

      history.replace(
        newSearch ? `${previousPathname}?${newSearch}` : previousPathname
      );
    },
    [history, paramName]
  );

  return [paramValue, setParamValue];
}
