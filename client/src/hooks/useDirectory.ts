import { useCallback, useEffect, useState } from 'react';
import { directoryApi } from '../api';
import { Category, Department, InventoryAudit, LocationItem, Supplier } from '../types';
import { useAlert } from '../context/AlertContext';

export function useDirectory() {
  const { showApiError } = useAlert();

  const [departments, setDepartments] = useState<Department[]>([]);
  const [locations, setLocations] = useState<LocationItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [audits, setAudits] = useState<InventoryAudit[]>([]);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    try {
      const [departmentList, locationList, categoryList, supplierList, auditList] =
        await Promise.all([
          directoryApi.getDepartments(),
          directoryApi.getLocations(),
          directoryApi.getCategories(),
          directoryApi.getSuppliers(),
          directoryApi.getAudits(),
        ]);

      setDepartments(departmentList);
      setLocations(locationList);
      setCategories(categoryList);
      setSuppliers(supplierList);
      setAudits(auditList);
    } catch (error) {
      showApiError(error);
    } finally {
      setLoading(false);
    }
  }, [showApiError]);

  useEffect(() => {
    reload();
  }, [reload]);

  return {
    departments,
    locations,
    categories,
    suppliers,
    audits,
    loading,
    reload,
    createDepartment: directoryApi.createDepartment,
    createCategory: directoryApi.createCategory,
    createSupplier: directoryApi.createSupplier,
    createAudit: directoryApi.createAudit,
    updateAuditStatus: directoryApi.updateAuditStatus,
  };
}
