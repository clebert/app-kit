import {createBrowserHistory} from 'history';
import * as preact from 'preact';
import {ErrorBoundary} from './components/error-boundary';
import {LoadingErrorUi} from './components/loading-error-ui';
import {HistoryContext} from './contexts/history-context';

export function main(app: preact.JSX.Element): void {
  preact.render(
    <HistoryContext.Provider value={createBrowserHistory()}>
      <ErrorBoundary>
        <LoadingErrorUi>{app}</LoadingErrorUi>
      </ErrorBoundary>
    </HistoryContext.Provider>,
    document.querySelector('#app')!
  );
}
