import React, { useState } from 'react';
import { useConfirm } from '../../context/ConfirmContext';

interface Props {
  onReset: () => Promise<void>;
}

export const ResetDatabaseCard: React.FC<Props> = ({ onReset }) => {
  const { confirm } = useConfirm();
  const [resetting, setResetting] = useState(false);

  const handleReset = async () => {
    const confirmed = await confirm({
      title: 'Сбросить базу данных?',
      message:
        'Все оборудование, заявки, операции, справочники и пользователи будут удалены, ' +
        'после чего база заново заполнится демонстрационными данными.\n\n' +
        'Текущая сессия завершится — потребуется войти заново.',
      confirmLabel: 'Сбросить',
      tone: 'danger',
    });
    if (!confirmed) return;

    setResetting(true);
    try {
      await onReset();
    } catch {
      setResetting(false);
    }
  };

  return (
    <div className="card danger-zone">
      <h3>Сброс базы данных</h3>
      <p className="muted">
        Удаляет все текущие данные и заново создаёт стандартный демонстрационный набор:
        оборудование, заявки, операции и учётные записи.
      </p>
      <button className="danger" onClick={handleReset} disabled={resetting}>
        {resetting ? 'Сброс...' : 'Сбросить базу данных'}
      </button>
    </div>
  );
};
