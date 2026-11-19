import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { User, UserRole } from '../../types';
import { ErrorView } from './ErrorView';
import { roleLabel } from '../../utils/roles';

interface Props {
  user: User;
}

interface PageSuggestion {
  path: string;
  title: string;
  roles: UserRole[];
}

const ALL_ROLES: UserRole[] = ['employee', 'manager', 'admin', 'root'];

const PAGES: PageSuggestion[] = [
  { path: '/', title: 'Главная', roles: ALL_ROLES },
  { path: '/equipment', title: 'Оборудование', roles: ALL_ROLES },
  { path: '/requests', title: 'Заявки', roles: ALL_ROLES },
  { path: '/operations/maintenance', title: 'Операции', roles: ALL_ROLES },
  { path: '/directory', title: 'Справочники', roles: ALL_ROLES },
  { path: '/audits', title: 'Инвентаризация', roles: ALL_ROLES },
  { path: '/users', title: 'Пользователи', roles: ['admin', 'root'] },
];

export const NotFoundView: React.FC<Props> = ({ user }) => {
  const location = useLocation();
  const availablePages = PAGES.filter((page) => page.roles.includes(user.role));

  return (
    <div className="tab-container">
      <ErrorView
        status={404}
        title="Страница не найдена"
        message={`Адрес «${location.pathname}» не существует или недоступен для роли «${roleLabel(
          user.role
        ).toLowerCase()}».`}
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
