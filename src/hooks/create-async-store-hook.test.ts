import {Subject} from 'ironhook';
import defer from 'p-defer';
import {
  AsyncStore,
  Snapshot,
  createAsyncStoreHook,
} from './create-async-store-hook';

jest.mock('preact/hooks', () => require('ironhook'));

interface AsyncStorageMock {
  pullState: jest.Mock;
  pushState: jest.Mock;
}

interface ObserverMock {
  next: jest.Mock;
  error: jest.Mock;
  complete: jest.Mock;
}

type State = string | undefined;

function queueMacrotask(): Promise<void> {
  const macrotask = defer<void>();

  setTimeout(() => macrotask.resolve(), 0);

  return macrotask.promise;
}

function queueMicrotask(): Promise<void> {
  return Promise.resolve().then();
}

function reducer(previousState: State, action: string): State {
  return (previousState || '') + action;
}

const useAsyncStore = createAsyncStoreHook(reducer, 'd');
const dispatch = expect.any(Function);

describe('useAsyncStore()', () => {
  let asyncStorage: AsyncStorageMock;
  let observer: ObserverMock;
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

    observer = {next: jest.fn(), error: jest.fn(), complete: jest.fn()};
  });

  describe('without async storage', () => {
    test('initializing -> idle', async () => {
      const subject = new Subject(() => useAsyncStore(undefined, 'x'));

      subject.subscribe(observer);

      await queueMacrotask();

      expect(observer.next.mock.calls).toEqual([
        [{readyState: 'initializing', state: 'x', dispatch}],
      ]);

      expect(observer.error.mock.calls).toEqual([]);
      expect(observer.complete.mock.calls).toEqual([]);
    });
  });

  test('initializing -> idle', async () => {
    const subject = new Subject(() => useAsyncStore(asyncStorage, 'x'));

    subject.subscribe(observer);

    await queueMicrotask();

    pullState1.resolve({state: 'a', version: 1});

    await queueMacrotask();

    expect(asyncStorage.pullState.mock.calls).toEqual([['d']]);
    expect(asyncStorage.pushState.mock.calls).toEqual([]);

    expect(observer.next.mock.calls).toEqual([
      [{readyState: 'initializing', state: 'x', dispatch}],
      [{readyState: 'idle', state: 'a', dispatch}],
    ]);

    expect(observer.error.mock.calls).toEqual([]);
    expect(observer.complete.mock.calls).toEqual([]);
  });

  test('initializing -> idle -> synchronizing -> idle', async () => {
    let asyncStore!: AsyncStore<State, string>;

    const subject = new Subject(
      () => (asyncStore = useAsyncStore(asyncStorage, 'x'))
    );

    subject.subscribe(observer);

    asyncStore.dispatch('y');

    await queueMicrotask();

    pullState1.resolve({state: 'a', version: 1});

    await queueMicrotask();

    asyncStore.dispatch('b');

    pushState1.resolve(undefined);

    await queueMicrotask();

    asyncStore!.dispatch('c');

    pullState2.resolve({state: 'z', version: 2});

    await queueMicrotask();

    pushState2.resolve({state: 'zybc!', version: 3});

    await queueMacrotask();

    expect(asyncStorage.pullState.mock.calls).toEqual([['d'], ['d']]);

    expect(asyncStorage.pushState.mock.calls).toEqual([
      ['ay', 1],
      ['zybc', 2],
    ]);

    expect(observer.next.mock.calls).toEqual([
      [{readyState: 'initializing', state: 'x', dispatch}],
      [{readyState: 'initializing', state: 'xy', dispatch}],
      [{readyState: 'synchronizing', state: 'ay', dispatch}],
      [{readyState: 'synchronizing', state: 'ay', dispatch}],
      [{readyState: 'synchronizing', state: 'ayb', dispatch}],
      [{readyState: 'synchronizing', state: 'aybc', dispatch}],
      [{readyState: 'synchronizing', state: 'zybc', dispatch}],
      [{readyState: 'synchronizing', state: 'zybc', dispatch}],
      [{readyState: 'idle', state: 'zybc!', dispatch}],
    ]);

    expect(observer.error.mock.calls).toEqual([]);
    expect(observer.complete.mock.calls).toEqual([]);
  });

  test('failing pullState()', async () => {
    const subject = new Subject(() => useAsyncStore(asyncStorage, 'x'));

    subject.subscribe(observer);

    await queueMicrotask();

    pullState1.reject(new Error('Oops!'));

    await queueMacrotask();

    expect(asyncStorage.pullState.mock.calls).toEqual([['d']]);
    expect(asyncStorage.pushState.mock.calls).toEqual([]);

    expect(observer.next.mock.calls).toEqual([
      [{readyState: 'initializing', state: 'x', dispatch}],
    ]);

    expect(observer.error.mock.calls).toEqual([[new Error('Oops!')]]);
    expect(observer.complete.mock.calls).toEqual([]);
  });

  test('failing pushState()', async () => {
    let asyncStore!: AsyncStore<State, string>;

    const subject = new Subject(
      () => (asyncStore = useAsyncStore(asyncStorage, 'x'))
    );

    subject.subscribe(observer);

    await queueMicrotask();

    pullState1.resolve({state: 'a', version: 1});

    await queueMicrotask();

    asyncStore.dispatch('b');

    pushState1.reject(new Error('Oops!'));

    await queueMacrotask();

    expect(asyncStorage.pullState.mock.calls).toEqual([['d']]);
    expect(asyncStorage.pushState.mock.calls).toEqual([['ab', 1]]);

    expect(observer.next.mock.calls).toEqual([
      [{readyState: 'initializing', state: 'x', dispatch}],
      [{readyState: 'idle', state: 'a', dispatch}],
      [{readyState: 'synchronizing', state: 'ab', dispatch}],
      [{readyState: 'synchronizing', state: 'ab', dispatch}],
    ]);

    expect(observer.error.mock.calls).toEqual([[new Error('Oops!')]]);
    expect(observer.complete.mock.calls).toEqual([]);
  });
});
