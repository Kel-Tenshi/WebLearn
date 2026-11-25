import React, { useState } from 'react';
import { Equipment, User } from '../../types';
import { useEquipment } from '../../hooks/useEquipment';
import { useTableControls } from '../../hooks/useTableControls';
import { useAlert } from '../../context/AlertContext';
import { useConfirm } from '../../context/ConfirmContext';
import { EquipmentForm } from './EquipmentForm';
import { EquipmentTable } from './EquipmentTable';
import { ListToolbar } from '../ui/ListToolbar';
import { Pagination } from '../ui/Pagination';
import { Loading } from '../ui/Loading';
import { ErrorView } from '../layout/ErrorView';
import { isManagerRole } from '../../utils/roles';
import { EQUIPMENT_STATUSES, toOptions } from '../../config/lists';

export const EquipmentTab: React.FC<{ user: User }> = ({ user }) => {
  const { showAlert, showApiError } = useAlert();
  const { confirm } = useConfirm();
  const { list, categories, locations, loading, error, reload, create, update, remove } = useEquipment();

  const [editingItem, setEditingItem] = useState<Equipment | null>(null);

  const canManage = isManagerRole(user.role);

  const statusOptions = toOptions(EQUIPMENT_STATUSES);
  const categoryOptions = categories.map((category) => ({
    value: category.name,
    label: category.name,
  }));
  const locationOptions = locations.map((location) => ({
    value: location.name,
    label: location.name,
  }));

  const controls = useTableControls(list, {
    search: (item) => [
      item.invNumber,
      item.serialNumber,
      item.name,
      item.categoryName,
      item.locationName,
      item.status,
    ],
    filters: [
      {
        key: 'status',
        label: 'Статус',
        options: statusOptions,
        getValue: (item) => item.status,
      },
      {
        key: 'category',
        label: 'Категория',
        options: categoryOptions,
        getValue: (item) => item.categoryName,
      },
      {
        key: 'location',
        label: 'Локация',
        options: locationOptions,
        getValue: (item) => item.locationName,
      },
    ],
    sorters: {
      invNumber: (item) => item.invNumber,
      serialNumber: (item) => item.serialNumber || '',
      name: (item) => item.name,
      categoryName: (item) => item.categoryName || '',
      locationName: (item) => item.locationName || '',
      purchaseCost: (item) => item.purchaseCost || 0,
      status: (item) => item.status,
    },
  });

  const handleSave = async (data: Partial<Equipment>) => {
    try {
      if (editingItem) {
        await update(editingItem.id, data);
        showAlert('Оборудование успешно обновлено', 'success');
        setEditingItem(null);
      } else {
        await create(data);
        showAlert('Оборудование успешно добавлено в реестр', 'success');
      }
      await reload();
    } catch (error) {
      showApiError(error);
      throw error;
    }
  };

  const handleDelete = async (id: number) => {
    const target = list.find((item) => item.id === id);
    const confirmed = await confirm({
      title: 'Удалить оборудование?',
      message: target
        ? `«${target.name}» (инв. № ${target.invNumber}) будет удалено из реестра без возможности восстановления.`
        : 'Оборудование будет удалено из реестра без возможности восстановления.',
      confirmLabel: 'Удалить',
      tone: 'danger',
    });
    if (!confirmed) return;

    try {
      await remove(id);
      showAlert('Оборудование удалено', 'success');
      await reload();
    } catch (error) {
      showApiError(error);
    }
  };

  if (loading) {
    return (
      <div className="tab-container">
        <h2>Оборудование</h2>
        <Loading label="Загрузка реестра оборудования…" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="tab-container">
        <h2>Оборудование</h2>
        <ErrorView error={error} onRetry={reload} />
      </div>
    );
  }

  return (
    <div className="tab-container">
      <h2>Оборудование</h2>

      {canManage && (
        <EquipmentForm
          categories={categories}
          locations={locations}
          editingItem={editingItem}
          onSubmit={handleSave}
          onCancel={() => setEditingItem(null)}
        />
      )}

      <ListToolbar
        search={controls.search}
        onSearchChange={controls.setSearch}
        placeholder="Найти оборудование по номеру, названию, категории…"
        hasActiveFilters={controls.hasActiveFilters}
        onReset={controls.resetFilters}
        filters={[
          {
            key: 'status',
            label: 'Статус',
            value: controls.filterValues.status || '',
            options: statusOptions,
            onChange: (value) => controls.setFilter('status', value),
          },
          {
            key: 'category',
            label: 'Категория',
            value: controls.filterValues.category || '',
            options: categoryOptions,
            onChange: (value) => controls.setFilter('category', value),
          },
          {
            key: 'location',
            label: 'Локация',
            value: controls.filterValues.location || '',
            options: locationOptions,
            onChange: (value) => controls.setFilter('location', value),
          },
        ]}
      />

      <EquipmentTable
        items={controls.items}
        canManage={canManage}
        onEdit={setEditingItem}
        onDelete={handleDelete}
        sortKey={controls.sortKey}
        sortDir={controls.sortDir}
        onSort={controls.toggleSort}
      />

      <Pagination
        page={controls.page}
        pageCount={controls.pageCount}
        pageSize={controls.pageSize}
        total={controls.total}
        filteredTotal={controls.filteredTotal}
        from={controls.from}
        to={controls.to}
        onPageChange={controls.setPage}
        onPageSizeChange={controls.setPageSize}
      />
    </div>
  );
};
