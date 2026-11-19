import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RequestsTable } from './RequestsTable';
import { RequestItem } from '../../types';

const baseRequest: RequestItem = {
  id: 1,
  type: 'Ремонт',
  title: 'Диагностика станка',
  applicant: 'user',
  applicantName: 'Петров Алексей Сергеевич',
  equipmentId: 1,
  priority: 'Высокий',
  status: 'На согласовании',
  createdAt: '2026-01-01 10:00',
  invNumber: 'ИНВ-000001',
  equipmentName: 'Токарный станок',
};

describe('RequestsTable', () => {
  test('в колонке «Заявитель» показывает ФИО вместо логина', () => {
    render(
      <RequestsTable
        requests={[baseRequest]}
        canManage={false}
        currentUserLogin="manager"
        onStatusChange={jest.fn()}
      />
    );

    expect(screen.getByText('Петров Алексей Сергеевич')).toBeInTheDocument();
    expect(screen.queryByText('user')).not.toBeInTheDocument();
  });

  test('если ФИО нет — показывает исходное значение', () => {
    render(
      <RequestsTable
        requests={[{ ...baseRequest, applicant: 'АО ЛабСервис', applicantName: null }]}
        canManage={false}
        currentUserLogin="manager"
        onStatusChange={jest.fn()}
      />
    );

    expect(screen.getByText('АО ЛабСервис')).toBeInTheDocument();
  });

  test('менеджер видит все действия по статусу', () => {
    render(
      <RequestsTable
        requests={[baseRequest]}
        canManage
        currentUserLogin="manager"
        onStatusChange={jest.fn()}
      />
    );

    expect(screen.getByRole('button', { name: 'Одобрить' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Отклонить' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Отменить' })).toBeInTheDocument();
  });

  test('сотрудник может отменить только свою активную заявку', async () => {
    const onStatusChange = jest.fn();
    render(
      <RequestsTable
        requests={[
          { ...baseRequest, id: 1, status: 'В работе' },
          { ...baseRequest, id: 2, applicant: 'manager', applicantName: null, status: 'В работе' },
        ]}
        canManage={false}
        currentUserLogin="user"
        onStatusChange={onStatusChange}
      />
    );

    const cancelButtons = screen.getAllByRole('button', { name: 'Отменить' });
    expect(cancelButtons).toHaveLength(1);

    await userEvent.click(cancelButtons[0]);
    expect(onStatusChange).toHaveBeenCalledWith(1, 'Отменено');
  });

  test('для завершённой заявки действий нет', () => {
    render(
      <RequestsTable
        requests={[{ ...baseRequest, status: 'Выполнено' }]}
        canManage
        currentUserLogin="manager"
        onStatusChange={jest.fn()}
      />
    );

    expect(screen.queryByRole('button')).not.toBeInTheDocument();
    expect(screen.getByText('—')).toBeInTheDocument();
  });
});
