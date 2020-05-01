import {HookProcess} from 'batis';
import defer from 'p-defer';
import {Snapshot, createAsyncStoreHook} from './create-async-store-hook';

jest.mock('preact/hooks', () => require('batis'));

interface AsyncStorageMock {
  pullState: jest.Mock;
  pushState: jest.Mock;
}

type State = string | undefined;

function reducer(previousState: State, action: string): State {
  return (previousState || '') + action;
}

const useAsyncStore = createAsyncStoreHook(reducer, 'd');

describe('useAsyncStore()', () => {
  let asyncStorage: AsyncStorageMock;
  let pullState1: defer.DeferredPromise<Snapshot<State, number>>;
  let pullState2: defer.DeferredPromise<Snapshot<State, number>>;
  let pushState1: defer.DeferredPromise<Snapshot<State, number> | undefined>;
  let pushState2: defer.DeferredPromise<Snapshot<State, number> | undefined>;

  beforeEach(() => {
    asyncStorage = {pullState: jest.fn(), pushState: jest.fn()};

    pullState1 = defer();
    pullState2 = defer();

    asyncStorage.pullState
      .mockReturnValueOnce(pullState1.promise)
      .mockReturnValueOnce(pullState2.promise);

    pushState1 = defer();
    pushState2 = defer();

    asyncStorage.pushState
      .mockReturnValueOnce(pushState1.promise)
      .mockReturnValueOnce(pushState2.promise);
  });

  test('initializing -> idle', async () => {
    const {result, update} = HookProcess.start(useAsyncStore, [undefined, 'x']);

    expect(result.getCurrent()).toEqual({
      readyState: 'initializing',
      state: 'x',
      dispatch: expect.any(Function),
    });

    expect(update([asyncStorage, 'x'])).toEqual({
      readyState: 'initializing',
      state: 'x',
      dispatch: expect.any(Function),
    });

    pullState1.resolve({state: 'a', version: 1});

    await expect(result.getNextAsync()).resolves.toEqual({
      readyState: 'idle',
      state: 'a',
      dispatch: expect.any(Function),
    });
  });

  test('initializing -> idle -> synchronizing -> idle', async () => {
    const {result} = HookProcess.start(useAsyncStore, [asyncStorage, 'x']);
    const {dispatch} = result.getCurrent();

    expect(result.getCurrent()).toEqual({
      readyState: 'initializing',
      state: 'x',
      dispatch: expect.any(Function),
    });

    dispatch('y');

    await expect(result.getNextAsync()).resolves.toEqual({
      readyState: 'initializing',
      state: 'xy',
      dispatch: expect.any(Function),
    });

    expect(asyncStorage.pullState).toHaveBeenCalledTimes(1);
    pullState1.resolve({state: 'a', version: 1});

    await expect(result.getNextAsync()).resolves.toEqual({
      readyState: 'synchronizing',
      state: 'ay',
      dispatch: expect.any(Function),
    });

    dispatch('b');

    await expect(result.getNextAsync()).resolves.toEqual({
      readyState: 'synchronizing',
      state: 'ayb',
      dispatch: expect.any(Function),
    });

    expect(asyncStorage.pushState).toHaveBeenCalledTimes(1);
    pushState1.resolve(undefined);

    dispatch('c');

    await expect(result.getNextAsync()).resolves.toEqual({
      readyState: 'synchronizing',
      state: 'aybc',
      dispatch: expect.any(Function),
    });

    expect(asyncStorage.pullState).toHaveBeenCalledTimes(2);
    pullState2.resolve({state: 'z', version: 2});

    await expect(result.getNextAsync()).resolves.toEqual({
      readyState: 'synchronizing',
      state: 'zybc',
      dispatch: expect.any(Function),
    });

    expect(asyncStorage.pushState).toHaveBeenCalledTimes(2);
    pushState2.resolve({state: 'zybc!', version: 3});

    await expect(result.getNextAsync()).resolves.toEqual({
      readyState: 'idle',
      state: 'zybc!',
      dispatch: expect.any(Function),
    });

    expect(asyncStorage.pullState.mock.calls).toEqual([['d'], ['d']]);

    expect(asyncStorage.pushState.mock.calls).toEqual([
      ['ay', 1],
      ['zybc', 2],
    ]);
  });

  test('failing pullState()', async () => {
    const {result} = HookProcess.start(useAsyncStore, [asyncStorage, 'x']);

    pullState1.reject(new Error('Oops!'));

    expect(asyncStorage.pullState.mock.calls).toEqual([['d']]);
    expect(asyncStorage.pushState.mock.calls).toEqual([]);
    await expect(result.getNextAsync()).rejects.toEqual(new Error('Oops!'));
  });

  test('failing pushState()', async () => {
    const {result} = HookProcess.start(useAsyncStore, [asyncStorage, 'x']);
    const {dispatch} = result.getCurrent();

    pullState1.resolve({state: 'a', version: 1});

    dispatch('b');

    await expect(result.getNextAsync()).resolves.toEqual({
      readyState: 'synchronizing',
      state: 'ab',
      dispatch: expect.any(Function),
    });

    pushState1.reject(new Error('Oops!'));

    expect(asyncStorage.pullState.mock.calls).toEqual([['d']]);
    expect(asyncStorage.pushState.mock.calls).toEqual([['ab', 1]]);
    await expect(result.getNextAsync()).rejects.toEqual(new Error('Oops!'));
  });
});
