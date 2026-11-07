import { useCallback, useEffect, useState } from 'react';
import { directoryApi, equipmentApi } from '../api';
import { Category, Equipment, LocationItem } from '../types';
import { useAlert } from '../context/AlertContext';

export function useEquipment() {
  const { showApiError } = useAlert();

  const [list, setList] = useState<Equipment[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [locations, setLocations] = useState<LocationItem[]>([]);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    try {
      const [equipment, categoriesList, locationsList] = await Promise.all([
        equipmentApi.getAll(),
        directoryApi.getCategories(),
        directoryApi.getLocations(),
      ]);

      setList(equipment);
      setCategories(categoriesList);
      setLocations(locationsList);
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
    list,
    categories,
    locations,
    loading,
    reload,
    create: equipmentApi.create,
    update: equipmentApi.update,
    remove: equipmentApi.delete,
  };
}
