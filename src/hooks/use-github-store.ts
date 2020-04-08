import * as hooks from 'preact/hooks';
import {GithubApi, RepositoryId} from '../classes/github-api';
import {GithubStore} from '../classes/github-store';
import {GithubAuth} from '../hooks/use-github-auth';

export interface GithubStoreHookInit<TState> {
  readonly repositoryName: string;
  readonly filename: string;
  readonly initialState: TState;
}

export function useGithubStore<TState>(
  init: GithubStoreHookInit<TState>,
  githubAuth: GithubAuth
): GithubStore<TState> | undefined {
  const [error, setError] = hooks.useState<Error | undefined>(undefined);

  if (error) {
    throw error;
  }

  const [githubStore, setGithubStore] = hooks.useState<
    GithubStore<TState> | undefined
  >(undefined);

  hooks.useEffect(() => {
    if (githubAuth.readyState !== 'loggedIn') {
      return;
    }

    const {repositoryName, filename, initialState} = init;
    const {token, user} = githubAuth;
    const repositoryId: RepositoryId = {ownerName: user.login, repositoryName};
    const githubApi = new GithubApi(token);

    githubApi
      .getRepository(repositoryId)
      .then(async (repositoryResult) => {
        if (GithubApi.isErrorResult(repositoryResult)) {
          if (repositoryResult.code === 404) {
            GithubApi.assertSuccessfulResult(
              await githubApi.createRepository(repositoryName)
            );
          } else {
            throw new Error(repositoryResult.message);
          }
        }

        setGithubStore(
          new GithubStore<TState>({
            githubApi,
            repositoryId,
            referenceName: 'master',
            filename,
            initialState,
          })
        );
      })
      .catch(setError);
  }, [githubAuth]);

  return githubStore;
}
