import { useCallback, useEffect, useState } from 'react';
import { directoryApi } from '../api';
import { Category, Department, LocationItem, Supplier } from '../types';

export function useDirectory() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [locations, setLocations] = useState<LocationItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<unknown>(null);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
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
    } catch (loadError) {
      setError(loadError);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  return {
    departments,
    locations,
    categories,
    suppliers,
    loading,
    error,
    reload,
    createDepartment: directoryApi.createDepartment,
    createLocation: directoryApi.createLocation,
    createCategory: directoryApi.createCategory,
    createSupplier: directoryApi.createSupplier,
  };
}
