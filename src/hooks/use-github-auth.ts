import * as cookie from 'cookie';
import * as hooks from 'preact/hooks';
import {GetUserResultValue, GithubApi} from '../classes/github-api';
import {HistoryContext} from '../contexts/history-context';
import {useLocalStorage} from '../hooks/use-local-storage';
import {useSearchParam} from '../hooks/use-search-param';
import {createRandomValue} from '../utils/create-random-value';

export interface LoggedOutGithubAuth {
  readonly readyState: 'loggedOut';

  login(): void;
}

export interface LoggingInGithubAuth {
  readonly readyState: 'loggingIn';
}

export interface LoggedInGithubAuth {
  readonly readyState: 'loggedIn';
  readonly token: string;
  readonly user: GetUserResultValue;

  logout(): void;
}

export type GithubAuth =
  | LoggedOutGithubAuth
  | LoggingInGithubAuth
  | LoggedInGithubAuth;

export function useGithubAuth(authorizerApiPathname: string): GithubAuth {
  const [error, setError] = hooks.useState<Error | undefined>(undefined);

  if (error) {
    throw error;
  }

  const [loggedIn, setLoggedIn] = useLocalStorage('loggedIn');
  const [token, setToken] = useLocalStorage('token');
  const [tokenParam] = useSearchParam('token');
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

    window.location.href = `${authorizerApiPathname}?${searchParams.toString()}`;
  }, [loggedIn, token]);

  const originalPath = hooks.useMemo(
    () => sessionStorage.getItem('originalPath') || '/',
    []
  );

  const [sessionIdParam] = useSearchParam('sessionId');

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

  const [user, setUser] = hooks.useState<GetUserResultValue | undefined>(
    undefined
  );

  hooks.useEffect(() => {
    setUser(undefined);

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
          setUser(userResult.value);
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
      token && user
        ? {readyState: 'loggedIn', token, user, logout}
        : loggedIn === 'true'
        ? {readyState: 'loggingIn'}
        : {readyState: 'loggedOut', login},
    [loggedIn, token, user]
  );
}
