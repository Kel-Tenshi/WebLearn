import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { LogOut, UserRound } from 'lucide-react';
import { User } from '../../types';
import { ThemeSwitcher } from '../ui/ThemeSwitcher';
import { isAdminRole, roleLabel } from '../../utils/roles';

interface Props {
  user: User;
  onLogout: () => void;
}

export const Navbar: React.FC<Props> = ({ user, onLogout }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const displayName = user.fullName || user.login;
  const role = roleLabel(user.role);
  // Для root ФИО и название роли совпадают — не дублируем подпись
  const showRole = displayName.toLowerCase() !== role.toLowerCase();

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

  if (isAdminRole(user.role)) {
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
        <ThemeSwitcher />
        <button
          type="button"
          className="profile-user"
          onClick={() => navigate('/profile')}
          title="Открыть профиль"
          aria-label="Открыть профиль"
        >
          <UserRound size={14} aria-hidden="true" />
          <span>
            {displayName}
            {showRole && (
              <>
                {' '}(<strong>{role.toLowerCase()}</strong>)
              </>
            )}
          </span>
        </button>
        <button onClick={onLogout}>
          <LogOut size={14} aria-hidden="true" />
          Выйти
        </button>
      </div>
    </header>
  );
};
