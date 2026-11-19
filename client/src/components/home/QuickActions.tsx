import React from 'react';
import { Link } from 'react-router-dom';
import type { LucideIcon } from 'lucide-react';

export interface QuickAction {
  to: string;
  title: string;
  description: string;
  icon: LucideIcon;
}

interface Props {
  actions: QuickAction[];
}

// Ролевые действия вместо дублирования верхнего меню:
// каждая карточка ведёт сразу к форме нужного раздела.
export const QuickActions: React.FC<Props> = ({ actions }) => (
  <div className="quick-links">
    {actions.map((action) => {
      const Icon = action.icon;
      return (
        <Link key={`${action.to}-${action.title}`} to={action.to} className="quick-link quick-action">
          <span className="quick-action-icon" aria-hidden="true">
            <Icon size={18} />
          </span>
          <span className="quick-action-text">
            <b>{action.title}</b>
            <span>{action.description}</span>
          </span>
        </Link>
      );
    })}
  </div>
);
