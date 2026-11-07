import React from 'react';
import { Link } from 'react-router-dom';

export interface AttentionItem {
  key: string;
  title: string;
  description: string;
  count: number;
  link: string;
  tone: 'warning' | 'danger' | 'info';
}

interface Props {
  items: AttentionItem[];
}

export const AttentionList: React.FC<Props> = ({ items }) => {
  if (items.length === 0) {
    return <p className="muted">Всё под контролем — срочных задач нет.</p>;
  }

  return (
    <ul className="attention-list">
      {items.map((item) => (
        <li key={item.key} className={`attention-item tone-${item.tone}`}>
          <Link to={item.link} className="attention-link">
            <span className="attention-count">{item.count}</span>
            <span>
              <b>{item.title}</b>
              <span className="attention-description">{item.description}</span>
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
};
