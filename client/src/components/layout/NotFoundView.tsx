import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { User, UserRole } from '../../types';
import { ErrorView } from './ErrorView';

interface Props {
  user: User;
}

interface PageSuggestion {
  path: string;
  title: string;
  roles: UserRole[];
}

const PAGES: PageSuggestion[] = [
  { path: '/', title: 'Главная', roles: ['employee', 'manager', 'admin'] },
  { path: '/equipment', title: 'Оборудование', roles: ['employee', 'manager', 'admin'] },
  { path: '/requests', title: 'Заявки', roles: ['employee', 'manager', 'admin'] },
  { path: '/operations/maintenance', title: 'Операции', roles: ['employee', 'manager', 'admin'] },
  { path: '/directory', title: 'Справочники', roles: ['employee', 'manager', 'admin'] },
  { path: '/audits', title: 'Инвентаризация', roles: ['employee', 'manager', 'admin'] },
  { path: '/users', title: 'Пользователи', roles: ['admin'] },
];

export const NotFoundView: React.FC<Props> = ({ user }) => {
  const location = useLocation();
  const availablePages = PAGES.filter((page) => page.roles.includes(user.role));

  return (
    <div className="tab-container">
      <ErrorView
        status={404}
        title="Страница не найдена"
        message={`Адрес «${location.pathname}» не существует или недоступен для роли «${user.role}».`}
      >
        <div className="error-links">
          {availablePages.map((page) => (
            <Link key={page.path} to={page.path} className="error-link">
              {page.title}
            </Link>
          ))}
        </div>
      </ErrorView>
    </div>
  );
};
