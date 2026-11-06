import React, { createContext, useContext, useState, useCallback } from 'react';

export type AlertType = 'error' | 'warning' | 'success' | 'info';

export interface Toast {
  id: number;
  message: string;
  type: AlertType;
  status?: number;
}

interface AlertContextType {
  showAlert: (message: string, type?: AlertType, status?: number) => void;
  showApiError: (err: any) => void;
}

const AlertContext = createContext<AlertContextType>({
  showAlert: () => {},
  showApiError: () => {},
});

export const AlertProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showAlert = useCallback((message: string, type: AlertType = 'info', status?: number) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type, status }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 5000);
  }, []);

  const showApiError = useCallback(
    (err: any) => {
      const status = err?.status;
      const msg = err?.message || 'Непредвиденная ошибка сети или сервера';
      const type: AlertType = !status || status >= 500 ? 'error' : 'warning';
      showAlert(msg, type, status);
    },
    [showAlert]
  );

  const removeToast = (id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <AlertContext.Provider value={{ showAlert, showApiError }}>
      {children}
      <aside className="toast-container" aria-live="polite">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`toast-card toast-${t.type}`}
            onClick={() => removeToast(t.id)}
            title="Нажмите, чтобы закрыть"
          >
            <div className="toast-header">
              {t.status ? <span className="toast-badge">{t.status}</span> : null}
              <span className="toast-title">
                {t.type === 'error'
                  ? 'Ошибка сервера'
                  : t.type === 'warning'
                  ? 'Предупреждение'
                  : t.type === 'success'
                  ? 'Успешно'
                  : 'Информация'}
              </span>
            </div>
            <div className="toast-body">{t.message}</div>
          </div>
        ))}
      </aside>
    </AlertContext.Provider>
  );
};

export const useAlert = () => useContext(AlertContext);