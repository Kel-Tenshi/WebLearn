import React from 'react';

interface Props {
  label?: string;
}

export const Loading: React.FC<Props> = ({ label = 'Загрузка данных…' }) => (
  <div className="loading-block" role="status" aria-live="polite">
    <span className="loading-spinner" aria-hidden="true" />
    <span>{label}</span>
  </div>
);
