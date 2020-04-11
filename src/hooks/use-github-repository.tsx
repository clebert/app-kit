import * as hooks from 'preact/hooks';
import {GithubApi, RepositoryId} from '../classes/github-api';
import {
  GithubAuth,
  LoggedInGithubAuth,
  LoggedOutGithubAuth,
  LoggingInGithubAuth,
} from './use-github-auth';

export interface UnauthorizedGithubRepository {
  readonly readyState: 'unauthorized';
  readonly githubAuth: LoggedOutGithubAuth | LoggingInGithubAuth;
}

export interface IncompleteGithubRepository {
  readonly readyState: 'incomplete';
  readonly githubAuth: LoggedInGithubAuth;
}

export interface SearchingGithubRepository {
  readonly readyState: 'searching';
  readonly githubAuth: LoggedInGithubAuth;
  readonly repositoryId: RepositoryId;
}

export interface AccessibleGithubRepository {
  readonly readyState: 'accessible';
  readonly githubAuth: LoggedInGithubAuth;
  readonly repositoryId: RepositoryId;
  readonly created: boolean;
  readonly writable: boolean;
}

export interface CreateGithubRepositoryOptions {
  readonly private?: boolean;
}

export interface UnknownGithubRepository {
  readonly readyState: 'unknown';
  readonly githubAuth: LoggedInGithubAuth;
  readonly repositoryId: RepositoryId;

  create(options?: CreateGithubRepositoryOptions): void;
}

export interface CreatingGithubRepository {
  readonly readyState: 'creating';
  readonly githubAuth: LoggedInGithubAuth;
  readonly repositoryId: RepositoryId;
}

export interface InaccessibleGithubRepository {
  readonly readyState: 'inaccessible';
  readonly githubAuth: LoggedInGithubAuth;
  readonly repositoryId: RepositoryId;
}

export type GithubRepository =
  | UnauthorizedGithubRepository
  | IncompleteGithubRepository
  | SearchingGithubRepository
  | AccessibleGithubRepository
  | UnknownGithubRepository
  | CreatingGithubRepository
  | InaccessibleGithubRepository;

export function useGithubRepository(
  githubAuth: GithubAuth,
  repositoryId: RepositoryId | undefined
): GithubRepository {
  const [error, setError] = hooks.useState<Error | undefined>(undefined);

  if (error) {
    throw error;
  }

  const [
    searchedGithubRepository,
    setSearchedGithubRepository,
  ] = hooks.useState<
    | AccessibleGithubRepository
    | UnknownGithubRepository
    | CreatingGithubRepository
    | InaccessibleGithubRepository
    | undefined
  >(undefined);

  hooks.useEffect(() => {
    if (githubAuth.readyState !== 'loggedIn' || !repositoryId) {
      return;
    }

    const githubApi = new GithubApi(githubAuth.token);

    githubApi
      .getRepository(repositoryId)
      .then((getRepositoryResult) => {
        if (GithubApi.isErrorResult(getRepositoryResult)) {
          setSearchedGithubRepository({
            readyState: 'unknown',
            githubAuth,
            repositoryId,
            create: (options) => {
              setSearchedGithubRepository({
                readyState: 'creating',
                githubAuth,
                repositoryId,
              });

              const {ownerName, repositoryName} = repositoryId;

              const organizationName =
                ownerName !== githubAuth.user.login ? ownerName : undefined;

              githubApi
                .createRepository(repositoryName, {
                  organizationName,
                  private: options?.private,
                })
                .then((createRepositoryResult) => {
                  if (GithubApi.isErrorResult(createRepositoryResult)) {
                    setSearchedGithubRepository({
                      readyState: 'inaccessible',
                      githubAuth,
                      repositoryId,
                    });
                  } else {
                    setSearchedGithubRepository({
                      readyState: 'accessible',
                      githubAuth,
                      repositoryId,
                      created: true,
                      writable:
                        !createRepositoryResult.value.archived &&
                        createRepositoryResult.value.permissions.push,
                    });
                  }
                })
                .catch(setError);
            },
          });
        } else {
          setSearchedGithubRepository({
            readyState: 'accessible',
            githubAuth,
            repositoryId,
            created: false,
            writable:
              !getRepositoryResult.value.archived &&
              getRepositoryResult.value.permissions.push,
          });
        }
      })
      .catch(setError);
  }, [githubAuth, repositoryId?.ownerName, repositoryId?.repositoryName]);

  return hooks.useMemo<GithubRepository>(() => {
    if (githubAuth.readyState !== 'loggedIn') {
      return {readyState: 'unauthorized', githubAuth};
    }

    if (!repositoryId) {
      return {readyState: 'incomplete', githubAuth};
    }

    if (
      !searchedGithubRepository ||
      searchedGithubRepository.githubAuth !== githubAuth ||
      searchedGithubRepository.repositoryId.ownerName !==
        repositoryId.ownerName ||
      searchedGithubRepository.repositoryId.repositoryName !==
        repositoryId.repositoryName
    ) {
      return {readyState: 'searching', githubAuth, repositoryId};
    }

    return searchedGithubRepository;
  }, [
    githubAuth,
    repositoryId?.ownerName,
    repositoryId?.repositoryName,
    searchedGithubRepository,
  ]);
}
