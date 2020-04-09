import {createRandomValue} from '../utils/create-random-value';

export interface GithubApiSuccessfulResult<TValue> {
  readonly value: TValue;
  readonly eTag: string;
}

export interface GithubApiErrorResult {
  readonly message: string;
  readonly code?: number;
}

export type GithubApiResult<TValue> =
  | GithubApiSuccessfulResult<TValue>
  | GithubApiErrorResult;

export interface RepositoryId {
  readonly ownerName: string;
  readonly repositoryName: string;
}

// https://developer.github.com/v3/users/#response-with-public-profile-information
export interface GetUserResultValue {
  readonly login: string;
  readonly name: string;
}

// https://developer.github.com/v3/repos/#response-4
export interface GetRepositoryResultValue {
  readonly description: string;
}

// https://developer.github.com/v3/git/refs/#response
export interface GetReferenceResultValue {
  readonly object: {readonly sha: string};
}

// https://developer.github.com/v3/git/commits/#response
export interface GetCommitResultValue {
  readonly tree: {readonly sha: string};
}

// https://developer.github.com/v3/git/trees/#response
export interface GetTreeResultValue {
  readonly tree: {readonly path: string; readonly sha: string}[];
  readonly truncated: boolean;
}

// https://developer.github.com/v3/git/blobs/#response
export interface GetBlobResultValue {
  readonly content: string;
}

// https://developer.github.com/v3/repos/#response-2
export interface CreateRepositoryResultValue {}

// https://developer.github.com/v3/git/commits/#response-1
export interface CreateCommitResultValue {
  readonly sha: string;
}

// https://developer.github.com/v3/git/trees/#response-2
export interface CreateTreeResultValue {
  readonly sha: string;
  readonly truncated: boolean;
}

// https://developer.github.com/v3/git/blobs/#response-1
export interface CreateBlobResultValue {
  readonly sha: string;
}

// https://developer.github.com/v3/git/refs/#response-3
export interface UpdateReferenceResultValue {}

export interface CreateRepositoryOptions {
  readonly organizationName?: string;
  readonly description?: string;
  readonly isPrivate?: boolean;
}

const errorMessagePrefix = 'Fetching GitHub API failed: ';

export class GithubApi {
  public static isErrorResult(
    result: GithubApiResult<unknown>
  ): result is GithubApiErrorResult {
    return 'message' in result;
  }

  public static assertSuccessfulResult<TResultValue>(
    result: GithubApiResult<TResultValue>
  ): asserts result is GithubApiSuccessfulResult<TResultValue> {
    if (GithubApi.isErrorResult(result)) {
      throw new Error(result.message);
    }
  }

  private readonly baseHeaders: Readonly<Record<string, string>>;

  public constructor(token: string) {
    this.baseHeaders = {
      Accept: 'application/vnd.github.v3+json',
      Authorization: `token ${token}`,
    };
  }

  public async getUser(): Promise<GithubApiResult<GetUserResultValue>> {
    return this.fetchCacheable('/user', true);
  }

  public async getRepository(
    repositoryId: RepositoryId
  ): Promise<GithubApiResult<GetRepositoryResultValue>> {
    const {ownerName, repositoryName} = repositoryId;

    return this.fetchCacheable(`/repos/${ownerName}/${repositoryName}`, true);
  }

  public async getReference(
    repositoryId: RepositoryId,
    referenceName: string
  ): Promise<GithubApiResult<GetReferenceResultValue>> {
    const {ownerName, repositoryName} = repositoryId;

    return this.fetchCacheable(
      `/repos/${ownerName}/${repositoryName}/git/ref/heads/${referenceName}`,
      true
    );
  }

  public async getCommit(
    repositoryId: RepositoryId,
    commitSha: string
  ): Promise<GithubApiResult<GetCommitResultValue>> {
    const {ownerName, repositoryName} = repositoryId;

    return this.fetchCacheable(
      `/repos/${ownerName}/${repositoryName}/git/commits/${commitSha}`
    );
  }

  public async getTree(
    repositoryId: RepositoryId,
    treeSha: string
  ): Promise<GithubApiResult<GetTreeResultValue>> {
    const {ownerName, repositoryName} = repositoryId;

    return this.fetchCacheable(
      `/repos/${ownerName}/${repositoryName}/git/trees/${treeSha}`
    );
  }

  public async getBlob(
    repositoryId: RepositoryId,
    blobSha: string
  ): Promise<GithubApiResult<GetBlobResultValue>> {
    const {ownerName, repositoryName} = repositoryId;

    return this.fetchCacheable(
      `/repos/${ownerName}/${repositoryName}/git/blobs/${blobSha}`
    );
  }

  public async createRepository(
    repositoryName: string,
    options: CreateRepositoryOptions = {}
  ): Promise<GithubApiResult<CreateRepositoryResultValue>> {
    const {organizationName, description, isPrivate} = options;

    const pathname = organizationName
      ? `/orgs/${organizationName}/repos`
      : '/user/repos';

    return this.fetch('POST', pathname, {
      name: repositoryName,
      description,
      private: isPrivate,
      auto_init: true,
    });
  }

  public async createCommit(
    repositoryId: RepositoryId,
    message: string,
    treeSha: string,
    parentCommitSha?: string
  ): Promise<GithubApiResult<CreateCommitResultValue>> {
    const {ownerName, repositoryName} = repositoryId;

    return this.fetch(
      'POST',
      `/repos/${ownerName}/${repositoryName}/git/commits`,
      {
        message,
        tree: treeSha,
        parents: parentCommitSha ? [parentCommitSha] : [],
      }
    );
  }

  public async createTree(
    repositoryId: RepositoryId,
    blobPath: string,
    blobSha: string,
    baseTreeSha?: string
  ): Promise<GithubApiResult<CreateTreeResultValue>> {
    const {ownerName, repositoryName} = repositoryId;

    return this.fetch(
      'POST',
      `/repos/${ownerName}/${repositoryName}/git/trees`,
      {
        tree: [{path: blobPath, mode: '100644', type: 'blob', sha: blobSha}],
        base_tree: baseTreeSha,
      }
    );
  }

  public async createBlob(
    repositoryId: RepositoryId,
    content: string
  ): Promise<GithubApiResult<CreateBlobResultValue>> {
    const {ownerName, repositoryName} = repositoryId;

    return this.fetch(
      'POST',
      `/repos/${ownerName}/${repositoryName}/git/blobs`,
      {content, encoding: 'base64'}
    );
  }

  public async updateReference(
    repositoryId: RepositoryId,
    referenceName: string,
    commitSha: string
  ): Promise<GithubApiResult<UpdateReferenceResultValue>> {
    const {ownerName, repositoryName} = repositoryId;

    return this.fetch(
      'PATCH',
      `/repos/${ownerName}/${repositoryName}/git/refs/heads/${referenceName}`,
      {sha: commitSha, force: false}
    );
  }

  private async fetchCacheable<TResultValue>(
    pathname: string,
    bypassBrowserCache: boolean = false
  ): Promise<GithubApiResult<TResultValue>> {
    try {
      return this.createResult(
        await fetch(
          bypassBrowserCache
            ? `https://api.github.com${pathname}?bypassBrowserCache=${createRandomValue()}`
            : `https://api.github.com${pathname}`,
          {headers: this.baseHeaders}
        )
      );
    } catch (error) {
      return {message: errorMessagePrefix + error.message};
    }
  }

  private async fetch<TResultValue>(
    method: 'POST' | 'PATCH',
    pathname: string,
    params: object
  ): Promise<GithubApiResult<TResultValue>> {
    try {
      return this.createResult(
        await fetch(`https://api.github.com${pathname}`, {
          method,
          headers: {...this.baseHeaders, 'Content-Type': 'application/json'},
          body: JSON.stringify(params),
        })
      );
    } catch (error) {
      return {message: errorMessagePrefix + error.message};
    }
  }

  private async createResult<TResultValue>(
    response: Response
  ): Promise<GithubApiResult<TResultValue>> {
    const body = await response.json();

    if (response.status === 200 || response.status === 201) {
      const eTag = response.headers.get('etag');

      if (!eTag) {
        throw new Error('Missing response header "etag".');
      }

      return {value: body, eTag};
    }

    return {
      message: errorMessagePrefix + (body.message || response.statusText),
      code: response.status,
    };
  }
}
