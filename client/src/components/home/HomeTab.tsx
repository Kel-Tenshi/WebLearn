import React from 'react';
import { User } from '../../types';
import { useDashboard } from '../../hooks/useDashboard';
import { Loading } from '../ui/Loading';
import { ErrorView } from '../layout/ErrorView';
import { AttentionList } from './AttentionList';
import type { AttentionItem } from './AttentionList';
import { RecentRequests } from './RecentRequests';
import { QuickLinks } from './QuickLinks';
import type { QuickLink } from './QuickLinks';

const ROLE_LABELS: Record<User['role'], string> = {
  employee: 'Сотрудник',
  manager: 'Руководитель',
  admin: 'Администратор',
};

const ACTIVE_REQUEST_STATUSES = ['На согласовании', 'Одобрено', 'В работе'];
const ACTIVE_MAINTENANCE_STATUSES = ['Запланировано', 'Ожидает запчастей', 'В процессе'];
const ACTIVE_ORDER_STATUSES = ['Черновик', 'Согласован', 'В доставке'];

export const HomeTab: React.FC<{ user: User }> = ({ user }) => {
  const { requests, equipment, maintenance, transfers, orders, loading, error, reload } = useDashboard();

  const canManage = user.role === 'manager' || user.role === 'admin';
  const myRequests = requests.filter((request) => request.applicant === user.login);

  const recentRequests = [...myRequests]
    .sort((a, b) => {
      const byDate = (b.createdAt || '').localeCompare(a.createdAt || '');
      return byDate !== 0 ? byDate : b.id - a.id;
    })
    .slice(0, 5);

  const countBy = (values: string[], list: string[]) =>
    list.filter((value) => values.includes(value)).length;

  const pendingRequests = requests.filter((r) => r.status === 'На согласовании').length;
  const requestsInWork = requests.filter((r) => ['Одобрено', 'В работе'].includes(r.status)).length;
  const activeMaintenance = countBy(
    ACTIVE_MAINTENANCE_STATUSES,
    maintenance.map((item) => item.status)
  );
  const transfersInTransit = transfers.filter((item) => item.status === 'В пути').length;
  const activeOrders = countBy(ACTIVE_ORDER_STATUSES, orders.map((item) => item.status));
  const equipmentInRepair = equipment.filter((item) => item.status === 'В ремонте').length;
  const myActiveRequests = myRequests.filter((r) => ACTIVE_REQUEST_STATUSES.includes(r.status)).length;

  const attention: AttentionItem[] = [];

  if (canManage) {
    if (pendingRequests > 0) {
      attention.push({
        key: 'pending-requests',
        title: 'Заявки на согласовании',
        description: 'Нужно принять решение по заявкам сотрудников',
        count: pendingRequests,
        link: '/requests',
        tone: 'warning',
      });
    }
    if (requestsInWork > 0) {
      attention.push({
        key: 'requests-in-work',
        title: 'Заявки в работе',
        description: 'Одобренные заявки, которые ещё не выполнены',
        count: requestsInWork,
        link: '/requests',
        tone: 'info',
      });
    }
    if (activeMaintenance > 0) {
      attention.push({
        key: 'maintenance',
        title: 'ТО и ремонты',
        description: 'Запланированные, ожидающие запчастей или выполняемые работы',
        count: activeMaintenance,
        link: '/operations/maintenance',
        tone: 'warning',
      });
    }
    if (transfersInTransit > 0) {
      attention.push({
        key: 'transfers',
        title: 'Перемещения в пути',
        description: 'Ожидают приёма или отклонения',
        count: transfersInTransit,
        link: '/operations/transfers',
        tone: 'info',
      });
    }
    if (activeOrders > 0) {
      attention.push({
        key: 'orders',
        title: 'Заказы в работе',
        description: 'Черновики, согласованные и доставляемые заказы',
        count: activeOrders,
        link: '/operations/orders',
        tone: 'info',
      });
    }
    if (equipmentInRepair > 0) {
      attention.push({
        key: 'equipment-repair',
        title: 'Оборудование в ремонте',
        description: 'Проверьте ход ремонтных работ',
        count: equipmentInRepair,
        link: '/equipment',
        tone: 'warning',
      });
    }
  } else {
    if (myActiveRequests > 0) {
      attention.push({
        key: 'my-requests',
        title: 'Ваши заявки в работе',
        description: 'Заявки, которые ещё не выполнены',
        count: myActiveRequests,
        link: '/requests',
        tone: 'info',
      });
    }
    if (equipmentInRepair > 0) {
      attention.push({
        key: 'equipment-repair',
        title: 'Оборудование в ремонте',
        description: 'Часть техники временно недоступна',
        count: equipmentInRepair,
        link: '/equipment',
        tone: 'warning',
      });
    }
  }

  const links: QuickLink[] = [
    { to: '/equipment', title: 'Оборудование', description: 'Реестр техники и статусы' },
    { to: '/requests', title: 'Заявки', description: 'Создание и согласование' },
    { to: '/operations/maintenance', title: 'ТО и ремонт', description: 'Планы и журнал работ' },
    { to: '/operations/transfers', title: 'Перемещения', description: 'Передача между локациями' },
    { to: '/operations/orders', title: 'Заказы', description: 'Снабжение и поставщики' },
    { to: '/directory', title: 'Справочники', description: 'Подразделения, локации, категории' },
    { to: '/audits', title: 'Инвентаризация', description: 'Акты ревизий' },
  ];

  if (user.role === 'admin') {
    links.push({ to: '/users', title: 'Пользователи', description: 'Роли и доступы' });
  }

  if (loading) {
    return (
      <div className="tab-container">
        <Loading label="Загрузка сводки…" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="tab-container">
        <ErrorView error={error} onRetry={reload} />
      </div>
    );
  }

  return (
    <div className="tab-container home-page">
      <section className="home-hero">
        <h2>Здравствуйте, {user.fullName || user.login}</h2>
        <p>
          Вы вошли как <b>{ROLE_LABELS[user.role]}</b>. Ниже — текущая обстановка
          и быстрый доступ к разделам.
        </p>
      </section>

      <div className="home-grid">
        <section className="card">
          <h3>Требует внимания</h3>
          <AttentionList items={attention} />
        </section>

        <section className="card">
          <h3>Последние заявки</h3>
          <RecentRequests items={recentRequests} />
        </section>
      </div>

      <section className="home-section">
        <h3>Быстрый переход</h3>
        <QuickLinks links={links} />
      </section>
    </div>
  );
};
