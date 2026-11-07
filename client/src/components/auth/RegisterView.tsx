import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authApi } from '../../api';
import { User } from '../../types';
import { usePasswordStrength } from '../../hooks/usePasswordStrength';
import { FormField } from '../ui/FormField';
import { PasswordInput } from '../ui/PasswordInput';
import { SlideReveal } from '../ui/SlideReveal';
import { ThemeSwitcher } from '../ui/ThemeSwitcher';

interface Props {
  onSuccess: (user: User) => void;
}

export const RegisterView: React.FC<Props> = ({ onSuccess }) => {
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const navigate = useNavigate();

  const passwordStrength = usePasswordStrength(password);

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
      navigate('/');
    } catch (err: any) {
      setError(err?.message || 'Не удалось зарегистрироваться. Попробуйте ещё раз');
    }
  };

  return (
    <div className="auth-wrap">
      <div className="auth-box">
        <div className="auth-head">
          <h2>Регистрация</h2>
          <ThemeSwitcher variant="surface" />
        </div>
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
            <PasswordInput
              value={password}
              autoComplete="new-password"
              onChange={(value) => {
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
                {passwordStrength.hint && (
                  <div className="password-strength-hint">{passwordStrength.hint}</div>
                )}
              </div>
            )}
          </FormField>

          {/* Поле подтверждения появляется только после ввода пароля */}
          {password.length > 0 && (
            <SlideReveal>
              <FormField label="Подтвердите пароль:" error={errors.confirmPassword}>
                <PasswordInput
                  value={confirmPassword}
                  autoComplete="new-password"
                  onChange={(value) => {
                    setConfirmPassword(value);
                    if (errors.confirmPassword) setErrors({ ...errors, confirmPassword: '' });
                  }}
                />
              </FormField>
            </SlideReveal>
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
