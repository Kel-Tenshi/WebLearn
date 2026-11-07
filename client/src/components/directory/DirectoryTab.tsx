import React from 'react';
import { Supplier, User } from '../../types';
import { useDirectory } from '../../hooks/useDirectory';
import { useAlert } from '../../context/AlertContext';
import { AuditsCard } from './AuditsCard';
import { DepartmentsCard } from './DepartmentsCard';
import { CategoriesCard } from './CategoriesCard';
import { SuppliersCard } from './SuppliersCard';

export const DirectoryTab: React.FC<{ user: User }> = ({ user }) => {
  const { showAlert, showApiError } = useAlert();
  const {
    departments,
    locations,
    categories,
    suppliers,
    audits,
    reload,
    createDepartment,
    createCategory,
    createSupplier,
    createAudit,
    updateAuditStatus,
  } = useDirectory();

  const canManage = user.role === 'manager' || user.role === 'admin';

  const handleCreateDepartment = async (data: { name: string; code: string }) => {
    try {
      await createDepartment(data);
      showAlert('Подразделение добавлено', 'success');
      await reload();
    } catch (error) {
      showApiError(error);
      throw error;
    }
  };

  const handleCreateCategory = async (data: { name: string; code: string }) => {
    try {
      await createCategory(data);
      showAlert('Категория добавлена', 'success');
      await reload();
    } catch (error) {
      showApiError(error);
      throw error;
    }
  };

  const handleCreateSupplier = async (data: Partial<Supplier>) => {
    try {
      await createSupplier(data);
      showAlert('Поставщик добавлен', 'success');
      await reload();
    } catch (error) {
      showApiError(error);
      throw error;
    }
  };

  const handleCreateAudit = async (data: { locationId: number }) => {
    try {
      await createAudit(data);
      showAlert('Акт инвентаризации создан', 'success');
      await reload();
    } catch (error) {
      showApiError(error);
      throw error;
    }
  };

  const handleFinishAudit = async (id: number) => {
    try {
      await updateAuditStatus(id, 'Завершена', 'Проверено без замечаний');
      showAlert('Инвентаризация завершена', 'success');
      await reload();
    } catch (error) {
      showApiError(error);
    }
  };

  return (
    <div className="tab-container">
      <h2>Справочники и Инвентаризация (Аудит)</h2>

      <AuditsCard
        items={audits}
        locations={locations}
        canManage={canManage}
        onCreate={handleCreateAudit}
        onFinish={handleFinishAudit}
      />

      <div className="grid-3">
        <DepartmentsCard
          items={departments}
          canManage={canManage}
          onCreate={handleCreateDepartment}
        />
        <CategoriesCard
          items={categories}
          canManage={canManage}
          onCreate={handleCreateCategory}
        />
        <SuppliersCard
          items={suppliers}
          canManage={canManage}
          onCreate={handleCreateSupplier}
        />
      </div>
    </div>
  );
};
