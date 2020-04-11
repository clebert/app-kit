import {decode, encode} from 'universal-base64';
import {AsyncStorage, Snapshot} from '../hooks/use-async-store';
import {GithubApi, RepositoryId} from './github-api';

export interface GithubVersion {
  readonly commitSha: string;
  readonly treeSha: string;
}

export interface GithubStorageParams {
  readonly githubApi: GithubApi;
  readonly repositoryId: RepositoryId;
  readonly referenceName: string;
  readonly filename: string;
}

export class GithubStorage<TState>
  implements AsyncStorage<TState, GithubVersion> {
  public constructor(private readonly params: GithubStorageParams) {}

  public async pullState(
    defaultState: TState
  ): Promise<Snapshot<TState, GithubVersion>> {
    const {githubApi, repositoryId, referenceName, filename} = this.params;

    const referenceResult = await githubApi.getReference(
      repositoryId,
      referenceName
    );

    GithubApi.assertSuccessfulResult(referenceResult);

    const commitSha = referenceResult.value.object.sha;
    const commitResult = await githubApi.getCommit(repositoryId, commitSha);

    GithubApi.assertSuccessfulResult(commitResult);

    const treeSha = commitResult.value.tree.sha;
    const treeResult = await githubApi.getTree(repositoryId, treeSha);

    GithubApi.assertSuccessfulResult(treeResult);

    if (treeResult.value.truncated) {
      throw new Error('Too many files.');
    }

    const blobSha = treeResult.value.tree.find((item) => item.path === filename)
      ?.sha;

    const version: GithubVersion = {commitSha, treeSha};

    if (!blobSha) {
      return {state: defaultState, version};
    }

    const blobResult = await githubApi.getBlob(repositoryId, blobSha);

    GithubApi.assertSuccessfulResult(blobResult);

    const state = JSON.parse(decode(blobResult.value.content.trim()));

    return {state, version};
  }

  public async pushState(
    state: TState,
    baseVersion: GithubVersion
  ): Promise<Snapshot<TState, GithubVersion> | undefined> {
    const {githubApi, repositoryId, referenceName, filename} = this.params;

    const blobResult = await githubApi.createBlob(
      repositoryId,
      encode(JSON.stringify(state))
    );

    GithubApi.assertSuccessfulResult(blobResult);

    const treeResult = await githubApi.createTree(
      repositoryId,
      filename,
      blobResult.value.sha,
      baseVersion.treeSha
    );

    GithubApi.assertSuccessfulResult(treeResult);

    if (treeResult.value.truncated) {
      throw new Error('Too many files.');
    }

    const treeSha = treeResult.value.sha;

    const commitResult = await githubApi.createCommit(
      repositoryId,
      `Update "${filename}"`,
      treeSha,
      baseVersion.commitSha
    );

    GithubApi.assertSuccessfulResult(commitResult);

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
