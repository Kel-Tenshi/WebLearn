import React from 'react';
import type { StatusAction } from '../../config/statusMachine';

interface Props {
  actions: StatusAction[];
  onChange: (nextStatus: string) => void;
  disabled?: boolean;
}

export const StatusActions: React.FC<Props> = ({ actions, onChange, disabled }) => {
  if (actions.length === 0) return <span className="muted">—</span>;

  return (
    <div className="status-actions">
      {actions.map((action) => (
        <button
          key={action.to}
          type="button"
          className={`status-action tone-${action.tone}`}
          onClick={() => onChange(action.to)}
          disabled={disabled}
        >
          {action.label}
        </button>
      ))}
    </div>
  );
};
