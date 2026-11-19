import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LocationsCard } from './LocationsCard';

const departments = [
  { id: 1, name: 'Производственный цех №1', code: 'DEP-PROD1' },
  { id: 2, name: 'Складской комплекс', code: 'DEP-WH' },
];

function renderCard(canManage = true, onCreate = jest.fn().mockResolvedValue(undefined)) {
  const onUpdate = jest.fn().mockResolvedValue(undefined);
  const onDelete = jest.fn().mockResolvedValue(undefined);

  const utils = render(
    <LocationsCard
      items={[
        {
          id: 1,
          name: 'Центральный склад',
          building: 'Корпус А',
          room: 'Помещение 101',
          departmentName: 'Складской комплекс',
        },
      ]}
      departments={departments}
      canManage={canManage}
      onCreate={onCreate}
      onUpdate={onUpdate}
      onDelete={onDelete}
    />
  );

  return { ...utils, onCreate, onUpdate, onDelete };
}

describe('LocationsCard', () => {
  test('кнопка добавления — иконка с доступным именем', () => {
    renderCard();

    expect(screen.getByRole('button', { name: 'Добавить локацию' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Добавить локацию' })).toHaveAttribute(
      'title',
      'Добавить'
    );
  });

  test('список отображается без маркеров и с вторичными данными', () => {
    const { container } = renderCard();

    expect(screen.getByText('Центральный склад')).toBeInTheDocument();
    expect(
      screen.getByText('Корпус А · Помещение 101 · Складской комплекс')
    ).toBeInTheDocument();
    expect(container.querySelector('ul.directory-list')).toBeInTheDocument();
    expect(container.querySelector('li')).toBeInTheDocument();
    expect(container.querySelector('.directory-count')).toHaveTextContent('1');
  });

  test('валидация обязательных полей', async () => {
    const { onCreate } = renderCard();

    await userEvent.click(screen.getByRole('button', { name: 'Добавить локацию' }));

    expect(await screen.findByText('Укажите название локации')).toBeInTheDocument();
    expect(screen.getByText('Укажите здание')).toBeInTheDocument();
    expect(onCreate).not.toHaveBeenCalled();
  });

  test('отправляет обрезанные значения и выбранное подразделение', async () => {
    const onCreate = jest.fn().mockResolvedValue(undefined);
    renderCard(true, onCreate);

    await userEvent.type(screen.getByPlaceholderText('Название'), '  Новая локация  ');
    await userEvent.type(screen.getByPlaceholderText('Здание'), '  Корпус В  ');
    await userEvent.type(screen.getByPlaceholderText('Помещение'), '  Каб. 5  ');
    await userEvent.selectOptions(screen.getByRole('combobox'), '2');

    await userEvent.click(screen.getByRole('button', { name: 'Добавить локацию' }));

    await waitFor(() => {
      expect(onCreate).toHaveBeenCalledWith({
        name: 'Новая локация',
        building: 'Корпус В',
        room: 'Каб. 5',
        departmentId: 2,
      });
    });
  });

  test('редактирование подставляет значения и вызывает onUpdate', async () => {
    const { onUpdate } = renderCard();

    await userEvent.click(screen.getByRole('button', { name: 'Изменить: Центральный склад' }));

    expect(screen.getByPlaceholderText('Название')).toHaveValue('Центральный склад');
    expect(screen.getByPlaceholderText('Здание')).toHaveValue('Корпус А');
    expect(screen.getByText('редактирование')).toBeInTheDocument();

    await userEvent.clear(screen.getByPlaceholderText('Название'));
    await userEvent.type(screen.getByPlaceholderText('Название'), 'Новый склад');
    await userEvent.click(screen.getByRole('button', { name: 'Сохранить локацию' }));

    await waitFor(() => {
      expect(onUpdate).toHaveBeenCalledWith(1, {
        name: 'Новый склад',
        building: 'Корпус А',
        room: 'Помещение 101',
        departmentId: null,
      });
    });
  });

  test('удаление передаёт id и название', async () => {
    const { onDelete } = renderCard();

    await userEvent.click(screen.getByRole('button', { name: 'Удалить: Центральный склад' }));
    expect(onDelete).toHaveBeenCalledWith(1, 'Центральный склад');
  });

  test('без прав форма добавления скрыта', () => {
    renderCard(false);

    expect(screen.queryByRole('button', { name: 'Добавить локацию' })).not.toBeInTheDocument();
    expect(screen.queryByPlaceholderText('Название')).not.toBeInTheDocument();
    expect(screen.getByText('Центральный склад')).toBeInTheDocument();
  });

  test('пустой список показывает заглушку', () => {
    render(
      <LocationsCard
        items={[]}
        departments={departments}
        canManage={false}
        onCreate={jest.fn()}
        onUpdate={jest.fn()}
        onDelete={jest.fn()}
      />
    );

    expect(screen.getByText('Локаций пока нет')).toBeInTheDocument();
  });
});
