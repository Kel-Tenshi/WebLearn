import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { User } from '../../types';

interface Props {
  user: User;
  onLogout: () => void;
}

const ROLE_LABELS: Record<User['role'], string> = {
  employee: 'сотрудник',
  manager: 'руководитель',
  admin: 'администратор',
};

export const Navbar: React.FC<Props> = ({ user, onLogout }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const tabs = [
    { path: '/', label: 'Главная', active: location.pathname === '/' },
    { path: '/equipment', label: 'Оборудование', active: location.pathname === '/equipment' },
    { path: '/requests', label: 'Заявки', active: location.pathname === '/requests' },
    {
      path: '/operations',
      label: 'Операции',
      active: location.pathname.startsWith('/operations'),
    },
    { path: '/directory', label: 'Справочники', active: location.pathname === '/directory' },
    { path: '/audits', label: 'Инвентаризация', active: location.pathname === '/audits' },
  ];

  if (user.role === 'admin') {
    tabs.push({ path: '/users', label: 'Пользователи', active: location.pathname === '/users' });
  }

  return (
    <header className="topbar">
      <button className="brand" onClick={() => navigate('/')} title="На главную">
        АСУ Оборудование
      </button>
      <nav className="tabs">
        {tabs.map((tab) => (
          <button
            key={tab.path}
            className={tab.active ? 'active' : ''}
            onClick={() => navigate(tab.path)}
          >
            {tab.label}
          </button>
        ))}
      </nav>
      <div className="profile">
        <span>{user.login} (<strong>{ROLE_LABELS[user.role]}</strong>)</span>
        <button onClick={onLogout}>Выйти</button>
      </div>
    </header>
  );
};
