import React, { useState, useMemo, useLayoutEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ZxcvbnFactory } from '@zxcvbn-ts/core';
import * as zxcvbnCommonPackage from '@zxcvbn-ts/language-common';
import * as zxcvbnRuPackage from '@zxcvbn-ts/language-ru';
import { authApi } from '../api';
import { User } from '../types';
import { FormField } from './FormField';
import { PasswordInput } from './PasswordInput';

interface Props {
  onSuccess: (user: User) => void;
}

// Плавно разворачивает блок по высоте при появлении
const SlideReveal: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const ref = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;

    const targetHeight = el.scrollHeight;

    // Схлопываем до отрисовки, чтобы не было мигания
    el.style.height = '0px';
    el.style.opacity = '0';
    el.style.transform = 'translateY(-8px)';
    el.style.overflow = 'hidden';

    const raf = window.requestAnimationFrame(() => {
      el.style.transition = 'height 0.3s ease, opacity 0.3s ease, transform 0.3s ease';
      el.style.height = `${targetHeight}px`;
      el.style.opacity = '1';
      el.style.transform = 'translateY(0)';
    });

    // После раскрытия убираем ограничение, чтобы tooltip ошибки не обрезался
    const timer = window.setTimeout(() => {
      el.style.height = 'auto';
      el.style.overflow = 'visible';
    }, 340);

    return () => {
      window.cancelAnimationFrame(raf);
      window.clearTimeout(timer);
    };
  }, []);

  return (
    <div ref={ref} style={{ overflow: 'hidden' }}>
      {children}
    </div>
  );
};

interface PasswordStrength {
  className: 'strength-weak' | 'strength-medium' | 'strength-strong';
  label: string;
  hint: string;
  width: string;
}

// Готовый анализатор zxcvbn с русскими словарями и подсказками
const zxcvbn = new ZxcvbnFactory({
  dictionary: {
    ...zxcvbnCommonPackage.dictionary,
    ...zxcvbnRuPackage.dictionary
  },
  graphs: zxcvbnCommonPackage.adjacencyGraphs,
  translations: zxcvbnRuPackage.translations
});

function getPasswordStrength(password: string): PasswordStrength | null {
  if (!password) return null;

  const result = zxcvbn.check(password);

  // score: 0 — совсем плохой, 4 — очень надёжный
  let className: PasswordStrength['className'];
  let label: string;

  if (result.score >= 3) {
    className = 'strength-strong';
    label = 'Надёжный пароль';
  } else if (result.score === 2) {
    className = 'strength-medium';
    label = 'Средний пароль';
  } else {
    className = 'strength-weak';
    label = 'Слабый пароль';
  }

  const hint = result.feedback.warning || result.feedback.suggestions[0] || '';

  return {
    className,
    label,
    hint,
    width: `${(result.score + 1) * 20}%`
  };
}

export const RegisterView: React.FC<Props> = ({ onSuccess }) => {
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const navigate = useNavigate();

  const passwordStrength = useMemo(() => getPasswordStrength(password), [password]);

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
