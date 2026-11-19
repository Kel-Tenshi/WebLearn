import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { Package, Plus } from 'lucide-react';
import { QuickActions } from './QuickActions';

describe('QuickActions', () => {
  test('выводит ролевые действия ссылками', () => {
    render(
      <MemoryRouter>
        <QuickActions
          actions={[
            {
              to: '/equipment',
              title: 'Добавить оборудование',
              description: 'Открыть форму реестра',
              icon: Plus,
            },
            {
              to: '/audits',
              title: 'Начать инвентаризацию',
              description: 'Новый акт ревизии',
              icon: Package,
            },
          ]}
        />
      </MemoryRouter>
    );

    const first = screen.getByRole('link', { name: /Добавить оборудование/ });
    expect(first).toHaveAttribute('href', '/equipment');
    expect(first).toHaveTextContent('Открыть форму реестра');

    expect(screen.getByRole('link', { name: /Начать инвентаризацию/ })).toHaveAttribute(
      'href',
      '/audits'
    );
  });
});
