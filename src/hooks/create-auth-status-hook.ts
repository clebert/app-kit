import * as cookie from 'cookie';
import * as hooks from 'preact/hooks';
import {GithubApi} from '../classes/github-api';
import {HistoryContext} from '../contexts/history-context';
import {createRandomValue} from '../utils/create-random-value';
import {createLocalStorageHook} from './create-local-storage-hook';
import {createParamHook} from './create-param-hook';

export interface LoggedOutAuthStatus {
  readonly readyState: 'loggedOut';

  login(): void;
}

export interface LoggingInAuthStatus {
  readonly readyState: 'loggingIn';
}

export interface LoggedInAuthStatus {
  readonly readyState: 'loggedIn';
  readonly token: string;
  readonly username: string;

  logout(): void;
}

export type AuthStatus =
  | LoggedOutAuthStatus
  | LoggingInAuthStatus
  | LoggedInAuthStatus;

export type AuthStatusHook = () => AuthStatus;

const useLoggedIn = createLocalStorageHook('loggedIn');
const useToken = createLocalStorageHook('token');
const useTokenParam = createParamHook('token');
const useSessionIdParam = createParamHook('sessionId');

export function createAuthStatusHook(
  authorizerPathname: string
): AuthStatusHook {
  return () => {
    const [error, setError] = hooks.useState<Error | undefined>(undefined);

    if (error) {
      throw error;
    }

    const [loggedIn, setLoggedIn] = useLoggedIn();
    const [token, setToken] = useToken();
    const [tokenParam] = useTokenParam();
    const history = hooks.useContext(HistoryContext);

    hooks.useEffect(() => {
      if (loggedIn !== 'true' || token || tokenParam) {
        return;
      }

      const newSessionId = createRandomValue();

      document.cookie = cookie.serialize('sessionId', newSessionId, {
        path: '/',
        sameSite: 'lax',
        secure: process.env.NODE_ENV !== 'development',
      });

      const {pathname, search} = history.location;

      sessionStorage.setItem(
        'originalPath',
        search ? `${pathname}${search}` : pathname
      );

      const searchParams = new URLSearchParams();

      searchParams.set('sessionId', newSessionId);

      window.location.href = `${authorizerPathname}?${searchParams.toString()}`;
    }, [loggedIn, token]);

    const originalPath = hooks.useMemo(
      () => sessionStorage.getItem('originalPath') || '/',
      []
    );

    const [sessionIdParam] = useSessionIdParam();

    const sessionId = hooks.useMemo(
      () => cookie.parse(document.cookie)['sessionId'] as string | undefined,
      []
    );

    hooks.useEffect(() => {
      if (!tokenParam) {
        return;
      }

      history.replace(originalPath);

      if (!sessionIdParam || sessionIdParam !== sessionId) {
        throw new Error('Untrusted OAuth transaction.');
      }

      setToken(tokenParam);
    }, [tokenParam]);

    const [username, setUsername] = hooks.useState<string | undefined>(
      undefined
    );

    hooks.useEffect(() => {
      setUsername(undefined);

      if (loggedIn !== 'true' || !token) {
        return;
      }

      const githubApi = new GithubApi(token);

      githubApi
        .getUser()
        .then((userResult) => {
          if (GithubApi.isErrorResult(userResult)) {
            if (userResult.code === 401) {
              setToken(undefined);
            } else {
              throw new Error(userResult.message);
            }
          } else {
            setUsername(userResult.value.login);
          }
        })
        .catch(setError);
    }, [loggedIn, token]);

    const login = hooks.useCallback(() => setLoggedIn('true'), []);

    const logout = hooks.useCallback(() => {
      setLoggedIn(undefined);
      setToken(undefined);

      localStorage.clear();
    }, []);

    return hooks.useMemo(
      () =>
        token && username
          ? {readyState: 'loggedIn', token, username, logout}
          : loggedIn === 'true'
          ? {readyState: 'loggingIn'}
          : {readyState: 'loggedOut', login},
      [loggedIn, token, username]
    );
  };
}
