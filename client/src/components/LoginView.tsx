import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authApi } from '../api';
import { User } from '../types';
import { FormField } from './FormField';
import { PasswordInput } from './PasswordInput';

interface Props {
  onSuccess: (user: User) => void;
}

export const LoginView: React.FC<Props> = ({ onSuccess }) => {
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const navigate = useNavigate();

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

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!validate()) return;

    try {
      const res = await authApi.login(login.trim(), password);
      onSuccess(res.user);
      navigate('/equipment');
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="auth-wrap">
      <div className="auth-box">
        <h2>Авторизация</h2>
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
              autoComplete="current-password"
              onChange={(value) => {
                setPassword(value);
                if (errors.password) setErrors({ ...errors, password: '' });
              }}
            />
          </FormField>
          <button type="submit" className="primary" style={{ width: '100%', marginTop: '10px' }}>
            Войти
          </button>
        </form>
        <div style={{ marginTop: 12 }}>
          <Link to="/register" className="link-btn">
            Нет аккаунта? Зарегистрироваться
          </Link>
        </div>
        <div className="demo-hint">
          Тестовые: <b>admin</b> / admin123 | <b>manager</b> / manager123 | <b>user</b> / user123
        </div>
      </div>
    </div>
  );
};
