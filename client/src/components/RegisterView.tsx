import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authApi } from '../utils/api';
import { User } from '../utils/types';

interface Props {
  onSuccess: (user: User) => void;
}

export const RegisterView: React.FC<Props> = ({ onSuccess }) => {
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      await authApi.register(login, password);
      const res = await authApi.login(login, password);
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
        <form onSubmit={handleSubmit}>
          <label>Логин:
            <input value={login} onChange={(e) => setLogin(e.target.value)} required />
          </label>
          <label>Пароль:
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </label>
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