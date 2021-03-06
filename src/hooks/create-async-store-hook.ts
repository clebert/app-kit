import * as hooks from 'preact/hooks';

export type Reducer<TState, TAction> = (
  previousState: TState,
  action: TAction
) => TState;

export interface Snapshot<TState, TVersion> {
  readonly state: TState;
  readonly version: TVersion;
}

export interface AsyncStorage<TState, TVersion> {
  pullState(defaultState: TState): Promise<Snapshot<TState, TVersion>>;

  pushState(
    state: TState,
    baseVersion: TVersion
  ): Promise<Snapshot<TState, TVersion> | undefined>;
}

export interface AsyncStore<TState, TAction> {
  readonly readyState: 'initializing' | 'synchronizing' | 'idle';
  readonly state: TState;

  dispatch(action: TAction): void;
}

export type AsyncStoreHook<TState, TAction, TVersion> = (
  asyncStorage: AsyncStorage<TState, TVersion> | undefined,
  initialState: TState
) => AsyncStore<TState, TAction>;

export function createAsyncStoreHook<TState, TAction, TVersion>(
  reducer: Reducer<TState, TAction>,
  defaultState: TState
): AsyncStoreHook<TState, TAction, TVersion> {
  return (asyncStorage, initialState) => {
    const [error, setError] = hooks.useState<Error | undefined>(undefined);

    if (error) {
      throw error;
    }

    const [snapshot, setSnapshot] = hooks.useState<
      Snapshot<TState, TVersion> | undefined
    >(undefined);

    const [unpushedActions, setUnpushedActions] = hooks.useState<TAction[]>([]);
    const [pushedActions, setPushedActions] = hooks.useState<TAction[]>([]);

    hooks.useEffect(() => {
      if (!asyncStorage) {
        setSnapshot(undefined);
      } else {
        asyncStorage.pullState(defaultState).then(setSnapshot).catch(setError);
      }
    }, [asyncStorage]);

    hooks.useEffect(() => {
      if (
        !asyncStorage ||
        !snapshot ||
        unpushedActions.length === 0 ||
        pushedActions.length > 0
      ) {
        return;
      }

      const actions = unpushedActions;

      setUnpushedActions([]);
      setPushedActions(actions);

      (async () => {
        const newSnapshot = await asyncStorage.pushState(
          actions.reduce(reducer, snapshot.state),
          snapshot.version
        );

        if (newSnapshot) {
          setSnapshot(newSnapshot);
          setPushedActions([]);
        } else {
          setSnapshot(await asyncStorage.pullState(defaultState));

          setUnpushedActions((previousActions) => [
            ...actions,
            ...previousActions,
          ]);

          setPushedActions([]);
        }
      })().catch(setError);
    }, [asyncStorage, snapshot, unpushedActions]);

    const dispatch = hooks.useCallback(
      (action: TAction) =>
        setUnpushedActions((previousActions) => [...previousActions, action]),
      []
    );

    return hooks.useMemo(
      () => ({
        readyState:
          !asyncStorage || !snapshot
            ? 'initializing'
            : unpushedActions.length + pushedActions.length > 0
            ? 'synchronizing'
            : 'idle',
        state: [...pushedActions, ...unpushedActions].reduce(
          reducer,
          asyncStorage && snapshot ? snapshot.state : initialState
        ),
        dispatch,
      }),
      [asyncStorage, initialState, snapshot, unpushedActions, pushedActions]
    );
  };
}
