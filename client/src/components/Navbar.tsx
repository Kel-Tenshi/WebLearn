import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { User } from '../utils/types';

interface Props {
  user: User;
  onLogout: () => void;
}

export const Navbar: React.FC<Props> = ({ user, onLogout }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const tabs = [
    { path: '/equipment', label: 'Оборудование' },
    { path: '/requests', label: 'Заявки' },
    { path: '/operations', label: 'Операции (ТО, Перемещения, Снабжение)' },
    { path: '/directory', label: 'Справочники и Аудит' },
  ];

  if (user.role === 'admin') {
    tabs.push({ path: '/users', label: 'Пользователи' });
  }

  return (
    <header className="topbar">
      <div className="brand">АСУ Оборудование</div>
      <nav className="tabs">
        {tabs.map((t) => (
          <button
            key={t.path}
            className={location.pathname === t.path ? 'active' : ''}
            onClick={() => navigate(t.path)}
          >
            {t.label}
          </button>
        ))}
      </nav>
      <div className="profile">
        <span>{user.login} (<strong>{user.role}</strong>)</span>
        <button onClick={onLogout}>Выйти</button>
      </div>
    </header>
  );
};