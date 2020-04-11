import * as hooks from 'preact/hooks';
import {GithubApi} from '../classes/github-api';
import {GithubStorage} from '../classes/github-storage';
import {AsyncStore, Reducer, useAsyncStore} from './use-async-store';
import {GithubRepository} from './use-github-repository';

export interface GithubStore<TState, TAction>
  extends AsyncStore<TState, TAction> {
  readonly githubRepository: GithubRepository;
  readonly referenceName: string;
  readonly filename: string;
}

export interface GithubStoreHookParams<TState, TAction> {
  readonly githubRepository: GithubRepository;
  readonly filename: string;
  readonly reducer: Reducer<TState, TAction>;
  readonly defaultState: TState;
  readonly cacheVersion?: number;
}

const referenceName = 'master';

export function useGithubStore<TState, TAction>(
  params: GithubStoreHookParams<TState, TAction>
): GithubStore<TState, TAction> {
  const {
    githubRepository,
    filename,
    reducer,
    defaultState,
    cacheVersion,
  } = params;

  const githubStorage = hooks.useMemo<GithubStorage<TState> | undefined>(() => {
    if (githubRepository.readyState !== 'accessible') {
      return undefined;
    }

    const {githubAuth, repositoryId} = githubRepository;

    return new GithubStorage({
      githubApi: new GithubApi(githubAuth.token),
      repositoryId,
      referenceName,
      filename,
    });
  }, [githubRepository, filename]);

  const cacheKey = hooks.useMemo(() => {
    if (
      cacheVersion === undefined ||
      githubRepository.readyState === 'unauthorized' ||
      githubRepository.readyState === 'incomplete'
    ) {
      return undefined;
    }

    const {githubAuth, repositoryId} = githubRepository;

    return [
      githubAuth.user.login,
      repositoryId.ownerName,
      repositoryId.repositoryName,
      referenceName,
      filename,
      cacheVersion,
    ].join('-');
  }, [githubRepository, filename, cacheVersion]);

  const rawCachedState = hooks.useMemo(
    () => (cacheKey && localStorage.getItem(cacheKey)) || undefined,
    [cacheKey]
  );

  const cachedState = hooks.useMemo(() => {
    if (rawCachedState) {
      try {
        return JSON.parse(rawCachedState) as TState;
      } catch (error) {
        console.error(`Unable to read cached state "${cacheKey}".`, error);
      }
    }

    return defaultState;
  }, [rawCachedState]);

  const asyncStore = useAsyncStore({
    asyncStorage: githubStorage,
    reducer,
    initialState: cachedState,
    defaultState,
  });

  hooks.useEffect(() => {
    if (cacheKey && asyncStore.readyState !== 'initializing') {
      try {
        localStorage.setItem(cacheKey, JSON.stringify(asyncStore.state));
      } catch (error) {
        console.error(`Unable to store cached state "${cacheKey}".`, error);
      }
    }
  }, [cacheKey, asyncStore]);

  return hooks.useMemo(
    () => ({...asyncStore, githubRepository, referenceName, filename}),
    [githubRepository, filename, asyncStore]
  );
}
