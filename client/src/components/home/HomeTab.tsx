import React from 'react';
import {
  ArrowLeftRight,
  ClipboardCheck,
  FilePlus,
  Package,
  Plus,
  ShoppingCart,
  Users,
  Wrench,
} from 'lucide-react';
import { User } from '../../types';
import { useDashboard } from '../../hooks/useDashboard';
import { Loading } from '../ui/Loading';
import { ErrorView } from '../layout/ErrorView';
import { AttentionList } from './AttentionList';
import type { AttentionItem } from './AttentionList';
import { RecentRequests } from './RecentRequests';
import { QuickActions } from './QuickActions';
import type { QuickAction } from './QuickActions';
import { isAdminRole, isManagerRole, roleLabel } from '../../utils/roles';

const ACTIVE_REQUEST_STATUSES = ['На согласовании', 'Одобрено', 'В работе'];
const ACTIVE_MAINTENANCE_STATUSES = ['Запланировано', 'Ожидает запчастей', 'В процессе'];
const ACTIVE_ORDER_STATUSES = ['Черновик', 'Согласован', 'В доставке'];

export const HomeTab: React.FC<{ user: User }> = ({ user }) => {
  const { requests, equipment, maintenance, transfers, orders, loading, error, reload } = useDashboard();

  const canManage = isManagerRole(user.role);
  const myRequests = requests.filter((request) => request.applicant === user.login);

  // Руководителям показываем последние заявки по всей системе,
  // сотруднику — только его собственные.
  const recentRequests = [...(canManage ? requests : myRequests)]
    .sort((a, b) => {
      const byDate = (b.createdAt || '').localeCompare(a.createdAt || '');
      return byDate !== 0 ? byDate : b.id - a.id;
    })
    .slice(0, 5);

  const displayName = user.fullName || user.login;
  const roleName = roleLabel(user.role);
  const nameEqualsRole = displayName.toLowerCase() === roleName.toLowerCase();

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

  const actions: QuickAction[] = canManage
    ? [
        {
          to: '/equipment',
          title: 'Добавить оборудование',
          description: 'Открыть форму реестра',
          icon: Plus,
        },
        {
          to: '/operations/maintenance',
          title: 'Назначить ТО',
          description: 'План работ и ремонтов',
          icon: Wrench,
        },
        {
          to: '/operations/transfers',
          title: 'Оформить перемещение',
          description: 'Передача между локациями',
          icon: ArrowLeftRight,
        },
        {
          to: '/operations/orders',
          title: 'Создать заказ',
          description: 'Снабжение и поставщики',
          icon: ShoppingCart,
        },
        {
          to: '/audits',
          title: 'Начать инвентаризацию',
          description: 'Новый акт ревизии',
          icon: ClipboardCheck,
        },
      ]
    : [
        {
          to: '/requests',
          title: 'Подать заявку',
          description: 'Ремонт, перемещение, закупка',
          icon: FilePlus,
        },
        {
          to: '/equipment',
          title: 'Реестр оборудования',
          description: 'Статусы и местонахождение',
          icon: Package,
        },
      ];

  if (isAdminRole(user.role)) {
    actions.push({
      to: '/users',
      title: 'Пользователи',
      description: 'Роли и доступы',
      icon: Users,
    });
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
        <h2>Здравствуйте, {displayName}</h2>
        <p>
          {nameEqualsRole ? (
            <>У вас полный доступ ко всем разделам.</>
          ) : (
            <>Вы вошли как <b>{roleName}</b>.</>
          )}{' '}
          Ниже — текущая обстановка и быстрые действия.
        </p>
      </section>

      <div className="home-grid">
        <section className="card">
          <h3>Требует внимания</h3>
          <AttentionList items={attention} />
        </section>

        <section className="card">
          <h3>Последние заявки</h3>
          <RecentRequests
            items={recentRequests}
            emptyText={canManage ? 'Заявок пока нет.' : 'У вас пока нет заявок.'}
          />
        </section>
      </div>

      <section className="home-section">
        <h3>Быстрые действия</h3>
        <QuickActions actions={actions} />
      </section>
    </div>
  );
};
