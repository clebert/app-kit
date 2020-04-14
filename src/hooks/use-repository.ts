import * as hooks from 'preact/hooks';
import {GithubApi, RepositoryId} from '../classes/github-api';
import {
  AuthStatus,
  LoggedInAuthStatus,
  LoggedOutAuthStatus,
  LoggingInAuthStatus,
} from './create-auth-status-hook';

export interface UnauthorizedRepository {
  readonly readyState: 'unauthorized';
  readonly authStatus: LoggedOutAuthStatus | LoggingInAuthStatus;
}

export interface IncompleteRepository {
  readonly readyState: 'incomplete';
  readonly authStatus: LoggedInAuthStatus;
}

export interface InSearchRepository {
  readonly readyState: 'inSearch';
  readonly authStatus: LoggedInAuthStatus;
  readonly repositoryId: RepositoryId;
}

export interface AccessibleRepository {
  readonly readyState: 'accessible';
  readonly authStatus: LoggedInAuthStatus;
  readonly repositoryId: RepositoryId;
  readonly created: boolean;
  readonly writable: boolean;
}

export interface CreateRepositoryOptions {
  readonly description?: string;
  readonly homepage?: string;
  readonly private?: boolean;
}

export interface UnknownRepository {
  readonly readyState: 'unknown';
  readonly authStatus: LoggedInAuthStatus;
  readonly repositoryId: RepositoryId;

  create(options?: CreateRepositoryOptions): void;
}

export interface InCreationRepository {
  readonly readyState: 'inCreation';
  readonly authStatus: LoggedInAuthStatus;
  readonly repositoryId: RepositoryId;
}

export interface InaccessibleRepository {
  readonly readyState: 'inaccessible';
  readonly authStatus: LoggedInAuthStatus;
  readonly repositoryId: RepositoryId;
}

export type Repository =
  | UnauthorizedRepository
  | IncompleteRepository
  | InSearchRepository
  | AccessibleRepository
  | UnknownRepository
  | InCreationRepository
  | InaccessibleRepository;

export function useRepository(
  authStatus: AuthStatus,
  repositoryId: RepositoryId | undefined
): Repository {
  const [error, setError] = hooks.useState<Error | undefined>(undefined);

  if (error) {
    throw error;
  }

  const [searchedRepository, setSearchedRepository] = hooks.useState<
    | AccessibleRepository
    | UnknownRepository
    | InCreationRepository
    | InaccessibleRepository
    | undefined
  >(undefined);

  hooks.useEffect(() => {
    if (authStatus.readyState !== 'loggedIn' || !repositoryId) {
      return;
    }

    const githubApi = new GithubApi(authStatus.token);

    githubApi
      .getRepository(repositoryId)
      .then((getRepositoryResult) => {
        if (GithubApi.isErrorResult(getRepositoryResult)) {
          setSearchedRepository({
            readyState: 'unknown',
            authStatus,
            repositoryId,
            create: (options = {}) => {
              setSearchedRepository({
                readyState: 'inCreation',
                authStatus,
                repositoryId,
              });

              const {ownerName, repositoryName} = repositoryId;

              const organizationName =
                ownerName !== authStatus.username ? ownerName : undefined;

              const {description, homepage} = options;

              githubApi
                .createRepository(repositoryName, {
                  organizationName,
                  description,
                  homepage,
                  private: options.private,
                })
                .then((createRepositoryResult) => {
                  if (GithubApi.isErrorResult(createRepositoryResult)) {
                    setSearchedRepository({
                      readyState: 'inaccessible',
                      authStatus,
                      repositoryId,
                    });
                  } else {
                    setSearchedRepository({
                      readyState: 'accessible',
                      authStatus,
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
          setSearchedRepository({
            readyState: 'accessible',
            authStatus,
            repositoryId,
            created: false,
            writable:
              !getRepositoryResult.value.archived &&
              getRepositoryResult.value.permissions.push,
          });
        }
      })
      .catch(setError);
  }, [authStatus, repositoryId?.ownerName, repositoryId?.repositoryName]);

  return hooks.useMemo<Repository>(() => {
    if (authStatus.readyState !== 'loggedIn') {
      return {readyState: 'unauthorized', authStatus};
    }

    if (!repositoryId) {
      return {readyState: 'incomplete', authStatus};
    }

    if (
      !searchedRepository ||
      searchedRepository.authStatus !== authStatus ||
      searchedRepository.repositoryId.ownerName !== repositoryId.ownerName ||
      searchedRepository.repositoryId.repositoryName !==
        repositoryId.repositoryName
    ) {
      return {readyState: 'inSearch', authStatus, repositoryId};
    }

    return searchedRepository;
  }, [
    authStatus,
    repositoryId?.ownerName,
    repositoryId?.repositoryName,
    searchedRepository,
  ]);
}
