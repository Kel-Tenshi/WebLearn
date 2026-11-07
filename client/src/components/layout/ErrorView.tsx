import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CircleAlert,
  FileQuestion,
  LockKeyhole,
  PlugZap,
  ServerCrash,
  ShieldAlert,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { describeError } from '../../utils/apiErrors';
import type { ErrorTone } from '../../utils/apiErrors';

interface Props {
  error?: unknown;
  status?: number;
  title?: string;
  message?: string;
  onRetry?: () => void;
  children?: React.ReactNode;
}

function iconForStatus(status: number): LucideIcon {
  switch (status) {
    case 0:
      return PlugZap;
    case 401:
      return LockKeyhole;
    case 403:
      return ShieldAlert;
    case 404:
      return FileQuestion;
    default:
      return status >= 500 ? ServerCrash : CircleAlert;
  }
}

function toneClass(tone: ErrorTone): string {
  if (tone === 'danger') return 'tone-danger';
  if (tone === 'warning') return 'tone-warning';
  return 'tone-info';
}

export const ErrorView: React.FC<Props> = ({
  error,
  status,
  title,
  message,
  onRetry,
  children,
}) => {
  const navigate = useNavigate();
  const info = describeError(error, status);
  const Icon = iconForStatus(info.status);

  return (
    <div className="error-view">
      <div className="error-card" role="alert">
        <span className={`error-icon ${toneClass(info.tone)}`} aria-hidden="true">
          <Icon size={26} />
        </span>

        <div className="error-code">{info.status > 0 ? info.status : '—'}</div>
        <h1 className="error-title">{title || info.title}</h1>
        <p className="error-message">{message || info.message}</p>

        {children}

        <div className="error-actions">
          {onRetry && (
            <button type="button" className="primary" onClick={onRetry}>
              Повторить
            </button>
          )}
          {info.status === 401 && !onRetry && (
            <button type="button" className="primary" onClick={() => navigate('/login')}>
              Войти
            </button>
          )}
          <button type="button" onClick={() => navigate(-1)}>
            Назад
          </button>
          <button type="button" onClick={() => navigate('/')}>
            На главную
          </button>
        </div>
      </div>
    </div>
  );
};
