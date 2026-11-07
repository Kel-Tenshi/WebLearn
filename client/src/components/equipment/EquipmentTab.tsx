import React, { useState } from 'react';
import { Equipment, User } from '../../types';
import { useEquipment } from '../../hooks/useEquipment';
import { useAlert } from '../../context/AlertContext';
import { EquipmentForm } from './EquipmentForm';
import { EquipmentTable } from './EquipmentTable';
import { Loading } from '../ui/Loading';

export const EquipmentTab: React.FC<{ user: User }> = ({ user }) => {
  const { showAlert, showApiError } = useAlert();
  const { list, categories, locations, loading, reload, create, update, remove } = useEquipment();

  const [search, setSearch] = useState('');
  const [editingItem, setEditingItem] = useState<Equipment | null>(null);

  const canManage = user.role === 'manager' || user.role === 'admin';

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
    if (!window.confirm('Удалить оборудование из базы?')) return;

    try {
      await remove(id);
      showAlert('Оборудование удалено', 'success');
      await reload();
    } catch (error) {
      showApiError(error);
    }
  };

  const filtered = list.filter((item) =>
    `${item.invNumber} ${item.name} ${item.categoryName || ''} ${item.locationName || ''}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="tab-container">
        <h2>Оборудование</h2>
        <Loading label="Загрузка реестра оборудования…" />
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

      <input
        type="search"
        placeholder="Поиск по инв. номеру, названию, категории..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="search-input"
      />

      <EquipmentTable
        items={filtered}
        canManage={canManage}
        onEdit={setEditingItem}
        onDelete={handleDelete}
      />
    </div>
  );
};
