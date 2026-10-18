import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { queryClient } from './lib/queryClient';
import './index.css';

// Opt in early to the two v7 behaviours we already rely on, so the router stops
// logging its deprecation warnings and the upgrade stays a no-op:
// `v7_startTransition` wraps router state updates in `startTransition`, and
// `v7_relativeSplatPath` changes how relative paths resolve under splat routes.
const ROUTER_FUTURE_FLAGS = {
  v7_startTransition: true,
  v7_relativeSplatPath: true,
} as const;

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter future={ROUTER_FUTURE_FLAGS}>
        <App />
      </BrowserRouter>
    </QueryClientProvider>
  </React.StrictMode>
);
