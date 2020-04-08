import * as hooks from 'preact/hooks';

export interface Snapshot<TState, TVersion> {
  readonly state: TState;
  readonly version: TVersion;
}

export interface AsyncStore<TState, TVersion> {
  pullState(): Promise<Snapshot<TState, TVersion>>;

  pushState(
    state: TState,
    baseVersion: TVersion
  ): Promise<Snapshot<TState, TVersion> | undefined>;
}

export type Reducer<TState, TAction> = (
  previousState: TState,
  action: TAction
) => TState;

export interface AsyncReducer<TState, TAction> {
  readonly readyState: 'initializing' | 'synchronizing' | 'idle';
  readonly state: TState;

  dispatch(action: TAction): void;
}

export function useAsyncReducer<TState, TAction, TVersion>(
  reducer: Reducer<TState, TAction>,
  asyncStore: AsyncStore<TState, TVersion> | undefined,
  initialState: TState
): AsyncReducer<TState, TAction> {
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
    asyncStore?.pullState().then(setSnapshot).catch(setError);
  }, [asyncStore]);

  hooks.useEffect(() => {
    if (
      !asyncStore ||
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
      const newSnapshot = await asyncStore.pushState(
        actions.reduce(reducer, snapshot.state),
        snapshot.version
      );

      if (newSnapshot) {
        setSnapshot(newSnapshot);
        setPushedActions([]);
      } else {
        setSnapshot(await asyncStore.pullState());

        setUnpushedActions((previousActions) => [
          ...actions,
          ...previousActions,
        ]);

        setPushedActions([]);
      }
    })().catch(setError);
  }, [asyncStore, snapshot, unpushedActions]);

  const dispatch = hooks.useCallback(
    (action: TAction) =>
      setUnpushedActions((previousActions) => [...previousActions, action]),
    []
  );

  return hooks.useMemo(
    () => ({
      readyState: !snapshot
        ? 'initializing'
        : unpushedActions.length + pushedActions.length > 0
        ? 'synchronizing'
        : 'idle',
      state: [...pushedActions, ...unpushedActions].reduce(
        reducer,
        snapshot ? snapshot.state : initialState
      ),
      dispatch,
    }),
    [initialState, snapshot, unpushedActions, pushedActions]
  );
}
