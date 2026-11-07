import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import './index.css';
import './styles/base.css';
import './styles/auth.css';
import './styles/forms.css';
import './styles/toasts.css';
import './styles/not-found.css';
import './styles/users.css';
import './styles/ui.css';
import './styles/home.css';
import App from './App';
import { AlertProvider } from './context/AlertContext';
import reportWebVitals from './reportWebVitals';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <AlertProvider>
        <App />
      </AlertProvider>
    </BrowserRouter>
  </React.StrictMode>
);

reportWebVitals();