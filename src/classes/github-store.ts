import {decode, encode} from 'universal-base64';
import {AsyncStore, Snapshot} from '../hooks/use-async-reducer';
import {GithubApi, RepositoryId} from './github-api';

export interface GithubVersion {
  readonly commitSha: string;
  readonly treeSha: string;
}

export interface GithubStoreInit<TState> {
  readonly githubApi: GithubApi;
  readonly repositoryId: RepositoryId;
  readonly referenceName: string;
  readonly filename: string;
  readonly initialState: TState;
}

export class GithubStore<TState> implements AsyncStore<TState, GithubVersion> {
  public constructor(private readonly init: GithubStoreInit<TState>) {}

  public async pullState(): Promise<Snapshot<TState, GithubVersion>> {
    const {
      githubApi,
      repositoryId,
      referenceName,
      filename,
      initialState,
    } = this.init;

    const referenceResult = GithubApi.assertSuccessfulResult(
      await githubApi.getReference(repositoryId, referenceName)
    );

    const commitSha = referenceResult.value.object.sha;

    const commitResult = GithubApi.assertSuccessfulResult(
      await githubApi.getCommit(repositoryId, commitSha)
    );

    const treeSha = commitResult.value.tree.sha;

    const treeResult = GithubApi.assertSuccessfulResult(
      await githubApi.getTree(repositoryId, treeSha)
    );

    if (treeResult.value.truncated) {
      throw new Error('Too many files.');
    }

    const blobSha = treeResult.value.tree.find((item) => item.path === filename)
      ?.sha;

    const version: GithubVersion = {commitSha, treeSha};

    if (!blobSha) {
      return {state: initialState, version};
    }

    const blobResult = GithubApi.assertSuccessfulResult(
      await githubApi.getBlob(repositoryId, blobSha)
    );

    const state = JSON.parse(decode(blobResult.value.content.trim()));

    return {state, version};
  }

  public async pushState(
    state: TState,
    baseVersion: GithubVersion
  ): Promise<Snapshot<TState, GithubVersion> | undefined> {
    const {githubApi, repositoryId, referenceName, filename} = this.init;

    const blobResult = GithubApi.assertSuccessfulResult(
      await githubApi.createBlob(repositoryId, encode(JSON.stringify(state)))
    );

    const treeResult = GithubApi.assertSuccessfulResult(
      await githubApi.createTree(
        repositoryId,
        filename,
        blobResult.value.sha,
        baseVersion.treeSha
      )
    );

    if (treeResult.value.truncated) {
      throw new Error('Too many files.');
    }

    const treeSha = treeResult.value.sha;

    const commitResult = GithubApi.assertSuccessfulResult(
      await githubApi.createCommit(
        repositoryId,
        `Update "${filename}"`,
        treeSha,
        baseVersion.commitSha
      )
    );

    const commitSha = commitResult.value.sha;

    const referenceResult = await githubApi.updateReference(
      repositoryId,
      referenceName,
      commitSha
    );

    if (GithubApi.isErrorResult(referenceResult)) {
      const {message, code} = referenceResult;

      if (code === 422) {
        /*
         * Known error messages:
         * - Update is not a fast forward
         * - Reference cannot be updated
         */
        console.debug(message);

        return undefined;
      }

      throw new Error(message);
    }

    return {state, version: {commitSha, treeSha}};
  }
}
