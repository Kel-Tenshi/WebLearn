import {
  getNextStatuses,
  getStatusActions,
  getStatusTone,
  EQUIPMENT_INITIAL_STATUSES,
} from './statusMachine';

describe('клиентская статус-машина', () => {
  test('переходы заявок', () => {
    expect(getNextStatuses('request', 'На согласовании')).toEqual([
      'Одобрено',
      'Отклонено',
      'Отменено',
    ]);
    expect(getNextStatuses('request', 'Выполнено')).toEqual([]);
    expect(getNextStatuses('request', 'Неизвестно')).toEqual([]);
  });

  test('подписи действий и опасные переходы', () => {
    const actions = getStatusActions('request', 'На согласовании');
    expect(actions).toEqual([
      { to: 'Одобрено', label: 'Одобрить', tone: 'primary' },
      { to: 'Отклонено', label: 'Отклонить', tone: 'danger' },
      { to: 'Отменено', label: 'Отменить', tone: 'danger' },
    ]);

    const orderActions = getStatusActions('order', 'Черновик');
    expect(orderActions.map((action) => action.label)).toEqual(['Согласовать', 'Отменить']);
  });

  test('начальные статусы оборудования', () => {
    expect(EQUIPMENT_INITIAL_STATUSES).toContain('Работает');
    expect(EQUIPMENT_INITIAL_STATUSES).not.toContain('Списано');
  });

  test('цвета статусов', () => {
    expect(getStatusTone('Работает')).toBe('success');
    expect(getStatusTone('В ремонте')).toBe('warning');
    expect(getStatusTone('Отменено')).toBe('danger');
    expect(getStatusTone('Получен')).toBe('success');
    expect(getStatusTone('Неизвестно')).toBe('neutral');
  });
});
