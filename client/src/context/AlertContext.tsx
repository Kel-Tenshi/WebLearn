import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';

export type AlertType = 'error' | 'warning' | 'success' | 'info';

export interface Toast {
  id: number;
  message: string;
  type: AlertType;
  status?: number;
  duration: number;
  closing?: boolean;
}

interface AlertContextType {
  showAlert: (message: string, type?: AlertType, status?: number, duration?: number) => void;
  showApiError: (err: any) => void;
}

// Сколько плашка висит на экране и сколько длится анимация исчезновения
const DEFAULT_DURATION = 3000;
const EXIT_ANIMATION_MS = 220;

const AlertContext = createContext<AlertContextType>({
  showAlert: () => {},
  showApiError: () => {},
});

export const AlertProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const timers = useRef<number[]>([]);

  useEffect(() => {
    const activeTimers = timers.current;
    return () => {
      activeTimers.forEach((timer) => window.clearTimeout(timer));
    };
  }, []);

  // Сначала помечаем плашку как закрывающуюся (чтобы проигралась анимация),
  // и только потом убираем её из состояния.
  const dismiss = useCallback((id: number) => {
    setToasts((prev) =>
      prev.map((t) => (t.id === id ? { ...t, closing: true } : t))
    );

    const timer = window.setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, EXIT_ANIMATION_MS);

    timers.current.push(timer);
  }, []);

  const showAlert = useCallback(
    (message: string, type: AlertType = 'info', status?: number, duration = DEFAULT_DURATION) => {
      const id = Date.now() + Math.random();
      setToasts((prev) => [...prev, { id, message, type, status, duration }]);

      const timer = window.setTimeout(() => dismiss(id), duration);
      timers.current.push(timer);
    },
    [dismiss]
  );

  const showApiError = useCallback(
    (err: any) => {
      const status = err?.status;
      const msg = err?.message || 'Непредвиденная ошибка сети или сервера';
      const type: AlertType = !status || status >= 500 ? 'error' : 'warning';
      showAlert(msg, type, status);
    },
    [showAlert]
  );

  return (
    <AlertContext.Provider value={{ showAlert, showApiError }}>
      {children}
      <aside className="toast-container" aria-live="polite">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`toast-card toast-${t.type}${t.closing ? ' closing' : ''}`}
            onClick={() => dismiss(t.id)}
            title="Нажмите, чтобы закрыть"
          >
            <div
              className="toast-progress"
              style={{ animationDuration: `${t.duration}ms` }}
            />
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
