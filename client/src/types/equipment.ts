export type EquipmentStatus = 'Работает' | 'В ремонте' | 'Простой' | 'Списано' | 'На консервации';

export interface Equipment {
  id: number;
  invNumber: string;
  serialNumber?: string | null;
  name: string;
  categoryId?: number | null;
  locationId?: number | null;
  status: EquipmentStatus;
  purchaseCost?: number;
  commissioningDate?: string | null;
  categoryName?: string | null;
  locationName?: string | null;
  departmentName?: string | null;
}
