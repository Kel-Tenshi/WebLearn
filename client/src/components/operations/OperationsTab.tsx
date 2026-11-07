import React from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { User } from '../../types';
import { MaintenanceTab } from './MaintenanceTab';
import { TransfersTab } from './TransfersTab';
import { OrdersTab } from './OrdersTab';

const SECTIONS = [
  { key: 'maintenance', label: 'ТО и ремонт' },
  { key: 'transfers', label: 'Перемещения' },
  { key: 'orders', label: 'Снабжение и заказы' },
];

export const OperationsTab: React.FC<{ user: User }> = ({ user }) => {
  const { section } = useParams<{ section: string }>();
  const navigate = useNavigate();

  const current = SECTIONS.some((item) => item.key === section) ? section : 'maintenance';

  if (section !== current) {
    return <Navigate to={`/operations/${current}`} replace />;
  }

  return (
    <div className="tab-container">
      <h2>Операции</h2>

      <div className="sub-nav">
        {SECTIONS.map((item) => (
          <button
            key={item.key}
            className={current === item.key ? 'active' : ''}
            onClick={() => navigate(`/operations/${item.key}`)}
          >
            {item.label}
          </button>
        ))}
      </div>

      {current === 'maintenance' && <MaintenanceTab user={user} />}
      {current === 'transfers' && <TransfersTab user={user} />}
      {current === 'orders' && <OrdersTab user={user} />}
    </div>
  );
};
