import React from 'react';
import { Supplier, User } from '../../types';
import { useDirectory } from '../../hooks/useDirectory';
import { useAlert } from '../../context/AlertContext';
import { useConfirm } from '../../context/ConfirmContext';
import { DepartmentsCard } from './DepartmentsCard';
import { LocationsCard } from './LocationsCard';
import { CategoriesCard } from './CategoriesCard';
import { SuppliersCard } from './SuppliersCard';
import { Loading } from '../ui/Loading';
import { ErrorView } from '../layout/ErrorView';
import { isManagerRole } from '../../utils/roles';

export const DirectoryTab: React.FC<{ user: User }> = ({ user }) => {
  const { showAlert, showApiError } = useAlert();
  const { confirm } = useConfirm();
  const {
    departments,
    locations,
    categories,
    suppliers,
    loading,
    error,
    reload,
    createDepartment,
    createLocation,
    createCategory,
    createSupplier,
    updateDepartment,
    updateLocation,
    updateCategory,
    updateSupplier,
    deleteDepartment,
    deleteLocation,
    deleteCategory,
    deleteSupplier,
  } = useDirectory();

  const canManage = isManagerRole(user.role);

  const runAction = async (action: () => Promise<unknown>, successMessage: string) => {
    try {
      await action();
      showAlert(successMessage, 'success');
      await reload();
    } catch (error) {
      showApiError(error);
      throw error;
    }
  };

  const runDelete = async (
    title: string,
    message: string,
    action: () => Promise<unknown>,
    successMessage: string
  ) => {
    const confirmed = await confirm({
      title,
      message,
      confirmLabel: 'Удалить',
      tone: 'danger',
    });
    if (!confirmed) return;

    try {
      await action();
      showAlert(successMessage, 'success');
      await reload();
    } catch (error) {
      showApiError(error);
    }
  };

  if (loading) {
    return (
      <div className="tab-container">
        <h2>Справочники</h2>
        <Loading label="Загрузка справочников…" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="tab-container">
        <h2>Справочники</h2>
        <ErrorView error={error} onRetry={reload} />
      </div>
    );
  }

  return (
    <div className="tab-container">
      <h2>Справочники</h2>

      <div className="grid-3">
        <DepartmentsCard
          items={departments}
          canManage={canManage}
          onCreate={(data) =>
            runAction(() => createDepartment(data), 'Подразделение добавлено')
          }
          onUpdate={(id, data) =>
            runAction(() => updateDepartment(id, data), 'Подразделение обновлено')
          }
          onDelete={(id, name) =>
            runDelete(
              'Удалить подразделение?',
              `Подразделение «${name}» будет удалено. Связанные локации и пользователи останутся без подразделения.`,
              () => deleteDepartment(id),
              'Подразделение удалено'
            )
          }
        />
        <LocationsCard
          items={locations}
          departments={departments}
          canManage={canManage}
          onCreate={(data) => runAction(() => createLocation(data), 'Локация добавлена')}
          onUpdate={(id, data) => runAction(() => updateLocation(id, data), 'Локация обновлена')}
          onDelete={(id, name) =>
            runDelete(
              'Удалить локацию?',
              `Локация «${name}» будет удалена. У оборудования она станет не указана.`,
              () => deleteLocation(id),
              'Локация удалена'
            )
          }
        />
        <CategoriesCard
          items={categories}
          canManage={canManage}
          onCreate={(data) => runAction(() => createCategory(data), 'Категория добавлена')}
          onUpdate={(id, data) => runAction(() => updateCategory(id, data), 'Категория обновлена')}
          onDelete={(id, name) =>
            runDelete(
              'Удалить категорию?',
              `Категория «${name}» будет удалена. У оборудования она станет не указана.`,
              () => deleteCategory(id),
              'Категория удалена'
            )
          }
        />
        <SuppliersCard
          items={suppliers}
          canManage={canManage}
          onCreate={(data: Partial<Supplier>) =>
            runAction(() => createSupplier(data), 'Поставщик добавлен')
          }
          onUpdate={(id, data) => runAction(() => updateSupplier(id, data), 'Поставщик обновлён')}
          onDelete={(id, name) =>
            runDelete(
              'Удалить поставщика?',
              `Поставщик «${name}» будет удалён. В существующих заказах поставщик станет не указан.`,
              () => deleteSupplier(id),
              'Поставщик удалён'
            )
          }
        />
      </div>
    </div>
  );
};
