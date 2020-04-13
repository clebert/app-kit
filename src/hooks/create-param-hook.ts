import * as hooks from 'preact/hooks';
import {HistoryContext} from '../contexts/history-context';
import {useLocation} from './use-location';

export type ParamHook = () => [
  string | undefined,
  (value: string | undefined) => void
];

export function createParamHook(paramName: string): ParamHook {
  return () => {
    const {search} = useLocation();

    const nativeParamValue = hooks.useMemo(
      () => new URLSearchParams(search).get(paramName),
      [search]
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
      [history]
    );

    return hooks.useMemo(() => [paramValue, setParamValue], [
      paramValue,
      setParamValue,
    ]);
  };
}
