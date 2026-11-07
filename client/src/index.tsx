import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import './index.css';
import './styles/theme.css';
import './styles/base.css';
import './styles/auth.css';
import './styles/forms.css';
import './styles/toasts.css';
import './styles/error.css';
import './styles/users.css';
import './styles/ui.css';
import './styles/home.css';
import App from './App';
import { AlertProvider } from './context/AlertContext';
import { ConfirmProvider } from './context/ConfirmContext';
import { ThemeProvider } from './context/ThemeContext';
import { ErrorBoundary } from './components/layout/ErrorBoundary';
import reportWebVitals from './reportWebVitals';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <ThemeProvider>
        <ConfirmProvider>
          <AlertProvider>
            <ErrorBoundary>
              <App />
            </ErrorBoundary>
          </AlertProvider>
        </ConfirmProvider>
      </ThemeProvider>
    </BrowserRouter>
  </React.StrictMode>
);

reportWebVitals();