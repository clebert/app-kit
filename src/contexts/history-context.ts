import {History, createMemoryHistory} from 'history';
import * as preact from 'preact';

export const HistoryContext = preact.createContext<History>(
  createMemoryHistory()
);
