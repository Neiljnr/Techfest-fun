import React from 'react';
import ReactDOM from 'react-dom/client';
import { AppProvider } from './context/AppContext';
import { App } from './App';
import { ScreenPage } from './components/ScreenPage';
import './index.css';

const isScreen = window.location.pathname.replace(/\/+$/, '') === '/screen';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {isScreen ? (
      <ScreenPage />
    ) : (
      <AppProvider>
        <App />
      </AppProvider>
    )}
  </React.StrictMode>
);
