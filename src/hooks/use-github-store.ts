import * as hooks from 'preact/hooks';
import {GithubApi} from '../classes/github-api';
import {GithubStorage} from '../classes/github-storage';
import {AsyncStore, useAsyncStore} from './use-async-store';
import {GithubRepository} from './use-github-repository';

export type Reducer<TState, TAction> = (
  state: TState,
  action: TAction
) => TState;

export interface GithubStoreHookParams<TState, TAction> {
  readonly githubRepository: GithubRepository;
  readonly filename: string;
  readonly reducer: Reducer<TState, TAction>;
  readonly defaultState: TState;
  readonly cacheVersion?: number;
}

export function useGithubStore<TState, TAction>(
  params: GithubStoreHookParams<TState, TAction>
): AsyncStore<TState, TAction> {
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
      referenceName: 'master',
      filename,
    });
  }, [githubRepository, filename]);

  const cacheKey = hooks.useMemo(
    () =>
      cacheVersion !== undefined &&
      githubRepository.readyState !== 'unauthorized'
        ? `${filename}-v${cacheVersion}-${githubRepository.githubAuth.user.login}`
        : undefined,
    [githubRepository]
  );

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

  const githubStore = useAsyncStore({
    asyncStorage: githubStorage,
    reducer,
    initialState: cachedState,
    defaultState,
  });

  hooks.useEffect(() => {
    if (cacheKey && githubStore.readyState !== 'initializing') {
      try {
        localStorage.setItem(cacheKey, JSON.stringify(githubStore.state));
      } catch (error) {
        console.error(`Unable to store cached state "${cacheKey}".`, error);
      }
    }
  }, [cacheKey, githubStore]);

  return githubStore;
}
