import React from 'react';
import { getStatusTone } from '../../config/statusMachine';

interface Props {
  status: string;
}

export const StatusBadge: React.FC<Props> = ({ status }) => (
  <span className={`status-badge tone-${getStatusTone(status)}`}>{status}</span>
);
