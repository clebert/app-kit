import {createBrowserHistory} from 'history';
import * as preact from 'preact';
import {ErrorBoundary} from './components/error-boundary';
import {ExternalError} from './components/external-error';
import {HistoryContext} from './contexts/history-context';

export function main(app: preact.JSX.Element): void {
  preact.render(
    <HistoryContext.Provider value={createBrowserHistory()}>
      <ErrorBoundary>
        <ExternalError>{app}</ExternalError>
      </ErrorBoundary>
    </HistoryContext.Provider>,
    document.querySelector('#app')!
  );
}
