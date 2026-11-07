import { useCallback, useEffect, useState } from 'react';
import { directoryApi, equipmentApi } from '../api';
import { Category, Equipment, LocationItem } from '../types';

export function useEquipment() {
  const [list, setList] = useState<Equipment[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [locations, setLocations] = useState<LocationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<unknown>(null);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [equipment, categoriesList, locationsList] = await Promise.all([
        equipmentApi.getAll(),
        directoryApi.getCategories(),
        directoryApi.getLocations(),
      ]);

      setList(equipment);
      setCategories(categoriesList);
      setLocations(locationsList);
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
    list,
    categories,
    locations,
    loading,
    error,
    reload,
    create: equipmentApi.create,
    update: equipmentApi.update,
    remove: equipmentApi.delete,
  };
}
