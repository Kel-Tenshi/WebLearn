import React from 'react';
import { Link } from 'react-router-dom';
import { RequestItem } from '../../types';
import { StatusBadge } from '../ui/StatusBadge';

interface Props {
  items: RequestItem[];
}

export const RecentRequests: React.FC<Props> = ({ items }) => {
  if (items.length === 0) {
    return <p className="muted">У вас пока нет заявок.</p>;
  }

  return (
    <ul className="recent-list">
      {items.map((item) => (
        <li key={item.id} className="recent-item">
          <div className="recent-main">
            <b>{item.title}</b>
            <span className="recent-meta">
              {item.type} · {(item.createdAt || '').slice(0, 16)}
            </span>
          </div>
          <StatusBadge status={item.status} />
        </li>
      ))}
      <li className="recent-more">
        <Link to="/requests">Все заявки →</Link>
      </li>
    </ul>
  );
};
