import * as hooks from 'preact/hooks';
import {GithubApi} from '../classes/github-api';
import {GithubStorage} from '../classes/github-storage';
import {
  AsyncStore,
  Reducer,
  createAsyncStoreHook,
} from './create-async-store-hook';
import {Repository} from './use-repository';

export interface RepositoryStore<TState, TAction>
  extends AsyncStore<TState, TAction> {
  readonly repository: Repository;
  readonly referenceName: string;
  readonly filename: string;
}

export type RepositoryStoreHook<TState, TAction> = (
  repository: Repository
) => RepositoryStore<TState, TAction>;

const referenceName = 'master';

export function createRepositoryStoreHook<TState, TAction>(
  filename: string,
  reducer: Reducer<TState, TAction>,
  defaultState: TState
): RepositoryStoreHook<TState, TAction> {
  const useAsyncStore = createAsyncStoreHook(reducer, defaultState);

  return (repository) => {
    const githubStorage = hooks.useMemo<
      GithubStorage<TState> | undefined
    >(() => {
      if (repository.readyState !== 'accessible') {
        return undefined;
      }

      const {authStatus, repositoryId} = repository;

      return new GithubStorage({
        githubApi: new GithubApi(authStatus.token),
        repositoryId,
        referenceName,
        filename,
      });
    }, [repository]);

    const cacheKey = hooks.useMemo(() => {
      if (
        repository.readyState === 'unauthorized' ||
        repository.readyState === 'incomplete'
      ) {
        return undefined;
      }

      const {authStatus, repositoryId} = repository;

      return [
        authStatus.username,
        repositoryId.ownerName,
        repositoryId.repositoryName,
        referenceName,
        filename,
      ].join('-');
    }, [repository]);

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
      () => ({...asyncStore, repository, referenceName, filename}),
      [repository, asyncStore]
    );
  };
}
