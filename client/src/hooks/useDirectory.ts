import { useCallback, useEffect, useState } from 'react';
import { directoryApi } from '../api';
import { Category, Department, LocationItem, Supplier } from '../types';
import { useAlert } from '../context/AlertContext';

export function useDirectory() {
  const { showApiError } = useAlert();

  const [departments, setDepartments] = useState<Department[]>([]);
  const [locations, setLocations] = useState<LocationItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    setLoading(true);
    try {
      const [departmentList, locationList, categoryList, supplierList] =
        await Promise.all([
          directoryApi.getDepartments(),
          directoryApi.getLocations(),
          directoryApi.getCategories(),
          directoryApi.getSuppliers(),
        ]);

      setDepartments(departmentList);
      setLocations(locationList);
      setCategories(categoryList);
      setSuppliers(supplierList);
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
    loading,
    reload,
    createDepartment: directoryApi.createDepartment,
    createLocation: directoryApi.createLocation,
    createCategory: directoryApi.createCategory,
    createSupplier: directoryApi.createSupplier,
  };
}
