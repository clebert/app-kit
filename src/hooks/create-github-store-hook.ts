import * as hooks from 'preact/hooks';
import {GithubApi} from '../classes/github-api';
import {GithubStorage} from '../classes/github-storage';
import {
  AsyncStore,
  Reducer,
  createAsyncStoreHook,
} from './create-async-store-hook';
import {GithubRepository} from './use-github-repository';

export interface GithubStore<TState, TAction>
  extends AsyncStore<TState, TAction> {
  readonly githubRepository: GithubRepository;
  readonly referenceName: string;
  readonly filename: string;
}

export type GithubStoreHook<TState, TAction> = (
  githubRepository: GithubRepository
) => GithubStore<TState, TAction>;

const referenceName = 'master';

export function createGithubStoreHook<TState, TAction>(
  filename: string,
  reducer: Reducer<TState, TAction>,
  defaultState: TState
): GithubStoreHook<TState, TAction> {
  const useAsyncStore = createAsyncStoreHook(reducer, defaultState);

  return (githubRepository) => {
    const githubStorage = hooks.useMemo<
      GithubStorage<TState> | undefined
    >(() => {
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
    }, [githubRepository]);

    const cacheKey = hooks.useMemo(() => {
      if (
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
      ].join('-');
    }, [githubRepository]);

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

    const asyncStore = useAsyncStore(githubStorage, cachedState);

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
      [githubRepository, asyncStore]
    );
  };
}
