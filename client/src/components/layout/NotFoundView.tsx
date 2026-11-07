import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { User, UserRole } from '../../types';

interface Props {
  user: User;
}

interface PageSuggestion {
  path: string;
  title: string;
  description: string;
  roles: UserRole[];
  badge: string;
}

export const NotFoundView: React.FC<Props> = ({ user }) => {
  const navigate = useNavigate();
  const location = useLocation();

  // Список всех разделов системы с разграничением по ролям
  const allPages: PageSuggestion[] = [
    {
      path: '/equipment',
      title: 'Оборудование',
      description: 'Карточки единиц оборудования, инвентарные номера, поиск, статусы и учет',
      roles: ['employee', 'manager', 'admin'],
      badge: 'Основной реестр'
    },
    {
      path: '/requests',
      title: 'Заявки',
      description: 'Подача и согласование заявок на ремонт, перемещение и закупку оборудования',
      roles: ['employee', 'manager', 'admin'],
      badge: 'Документооборот'
    },
    {
      path: '/operations',
      title: 'Операции (ТО, Перемещения, Снабжение)',
      description: 'Журнал технического обслуживания, история перемещений и заказы поставщикам',
      roles: ['employee', 'manager', 'admin'],
      badge: 'Управление'
    },
    {
      path: '/directory',
      title: 'Справочники и Аудит',
      description: 'Подразделения компании, склады, категории техники, поставщики и акты ревизии',
      roles: ['employee', 'manager', 'admin'],
      badge: 'Справочники'
    },
    {
      path: '/users',
      title: 'Управление пользователями',
      description: 'Список учетных записей, распределение ролей сотрудников и администрирование',
      roles: ['admin'],
      badge: 'Администратор'
    }
  ];

  // Доступные страницы строго под роль текущего пользователя
  const availablePages = allPages.filter((page) => page.roles.includes(user.role));

  return (
    <div className="tab-container not-found-wrapper">
      <div className="not-found-card">
        <div className="not-found-code">404</div>
        <h1 className="not-found-title">Страница не найдена</h1>
        <p className="not-found-desc">
          Адрес <code>{location.pathname}</code> не существует или у вашей роли нет доступа к данному разделу.
        </p>

        <div className="not-found-user-panel">
          Вы вошли как: <strong>{user.login}</strong> &bull; Роль в системе:{' '}
          <span className="badge">{user.role}</span>
        </div>

        <h3 className="not-found-subtitle">Доступные вам разделы системы:</h3>

        <div className="not-found-grid">
          {availablePages.map((page) => (
            <div
              key={page.path}
              className="not-found-tile"
              onClick={() => navigate(page.path)}
              role="button"
              tabIndex={0}
            >
              <div className="not-found-tile-head">
                <h4>{page.title}</h4>
                <span className="not-found-tag">{page.badge}</span>
              </div>
              <p>{page.description}</p>
              <div className="not-found-link">Перейти в раздел &rarr;</div>
            </div>
          ))}
        </div>

        <div className="not-found-actions">
          <button className="primary" onClick={() => navigate('/equipment')}>
            На главную (Оборудование)
          </button>
          <button onClick={() => navigate(-1)}>
            Вернуться назад
          </button>
        </div>
      </div>
    </div>
  );
};