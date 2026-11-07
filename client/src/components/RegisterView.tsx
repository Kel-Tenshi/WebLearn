import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authApi } from '../utils/api';
import { User } from '../utils/types';
import { FormField } from './FormField';

interface Props {
  onSuccess: (user: User) => void;
}

interface PasswordStrength {
  className: 'strength-weak' | 'strength-medium' | 'strength-strong';
  label: string;
  width: string;
}

// Простая оценка надёжности: длина, регистр, цифры и спецсимволы
function getPasswordStrength(password: string): PasswordStrength | null {
  if (!password) return null;

  const hasLower = /[a-zа-яё]/.test(password);
  const hasUpper = /[A-ZА-ЯЁ]/.test(password);
  const hasDigit = /\d/.test(password);
  const hasSpecial = /[^A-Za-zА-Яа-яЁё0-9]/.test(password);
  const classesCount = [hasLower, hasUpper, hasDigit, hasSpecial].filter(Boolean).length;

  let score = 0;
  if (password.length >= 6) score++;
  if (password.length >= 10) score++;
  if (hasLower && hasUpper) score++;
  if (hasDigit) score++;
  if (hasSpecial) score++;

  // Пароль из одного класса символов (например, только цифры) — всегда слабый
  if (classesCount <= 1) score = Math.min(score, 1);

  if (score >= 4) {
    return { className: 'strength-strong', label: 'Надёжный пароль', width: '100%' };
  }
  if (score >= 2) {
    return { className: 'strength-medium', label: 'Средний пароль', width: '66%' };
  }
  return { className: 'strength-weak', label: 'Слабый пароль', width: '33%' };
}

export const RegisterView: React.FC<Props> = ({ onSuccess }) => {
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const navigate = useNavigate();

  const passwordStrength = getPasswordStrength(password);

  const validate = (): boolean => {
    const errs: Record<string, string> = {};

    if (!login.trim()) {
      errs.login = 'Введите логин';
    } else if (login.trim().length < 3) {
      errs.login = 'Логин должен содержать минимум 3 символа';
    }

    if (!password) {
      errs.password = 'Введите пароль';
    } else if (password.length < 6) {
      errs.password = 'Пароль должен содержать минимум 6 символов';
    }

    if (password.length > 0) {
      if (!confirmPassword) {
        errs.confirmPassword = 'Подтвердите пароль';
      } else if (confirmPassword !== password) {
        errs.confirmPassword = 'Пароли не совпадают';
      }
    }

    if (fullName.trim().length > 120) {
      errs.fullName = 'ФИО не должно превышать 120 символов';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!validate()) return;

    try {
      const cleanLogin = login.trim();
      await authApi.register(cleanLogin, password, fullName.trim() || undefined);
      const res = await authApi.login(cleanLogin, password);
      onSuccess(res.user);
      navigate('/equipment');
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="auth-wrap">
      <div className="auth-box">
        <h2>Регистрация</h2>
        {error && <div className="error-banner">{error}</div>}
        <form onSubmit={handleSubmit} noValidate>
          <FormField label="Логин:" error={errors.login}>
            <input
              value={login}
              onChange={(e) => {
                setLogin(e.target.value);
                if (errors.login) setErrors({ ...errors, login: '' });
              }}
            />
          </FormField>

          <FormField label="Пароль:" error={errors.password}>
            <input
              type="password"
              autoComplete="new-password"
              value={password}
              onChange={(e) => {
                const value = e.target.value;
                setPassword(value);

                const nextErrors: Record<string, string> = { ...errors, password: '' };
                if (errors.confirmPassword) nextErrors.confirmPassword = '';

                if (!value) {
                  setConfirmPassword('');
                  nextErrors.confirmPassword = '';
                }

                setErrors(nextErrors);
              }}
            />

            {passwordStrength && (
              <div className="password-strength">
                <div className="password-strength-track">
                  <div
                    className={`password-strength-fill ${passwordStrength.className}`}
                    style={{ width: passwordStrength.width }}
                  />
                </div>
                <div className="password-strength-label">{passwordStrength.label}</div>
              </div>
            )}
          </FormField>

          {/* Поле подтверждения появляется только после ввода пароля */}
          {password.length > 0 && (
            <div className="field-reveal">
              <FormField label="Подтвердите пароль:" error={errors.confirmPassword}>
                <input
                  type="password"
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    if (errors.confirmPassword) setErrors({ ...errors, confirmPassword: '' });
                  }}
                />
              </FormField>
            </div>
          )}

          <FormField label="ФИО (необязательно):" error={errors.fullName}>
            <input
              value={fullName}
              onChange={(e) => {
                setFullName(e.target.value);
                if (errors.fullName) setErrors({ ...errors, fullName: '' });
              }}
            />
          </FormField>

          <button type="submit" className="primary" style={{ width: '100%', marginTop: '10px' }}>
            Зарегистрироваться
          </button>
        </form>
        <div style={{ marginTop: 12 }}>
          <Link to="/login" className="link-btn">
            Уже есть аккаунт? Войти
          </Link>
        </div>
      </div>
    </div>
  );
};
