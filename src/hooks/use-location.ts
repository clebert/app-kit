import {Location} from 'history';
import * as hooks from 'preact/hooks';
import {HistoryContext} from '../contexts/history-context';

export function useLocation(): Location {
  const history = hooks.useContext(HistoryContext);
  const [, setLocation] = hooks.useState(history.location);

  hooks.useEffect(() => history.listen(setLocation), [history]);

  return history.location;
}
