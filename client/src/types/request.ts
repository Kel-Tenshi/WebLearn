export type RequestType = 'Перемещение' | 'Списание' | 'Закупка' | 'Ремонт';
export type RequestPriority = 'Низкий' | 'Средний' | 'Высокий' | 'Критический';
export type RequestStatus =
  | 'На согласовании'
  | 'Одобрено'
  | 'В работе'
  | 'Выполнено'
  | 'Отклонено'
  | 'Отменено';

export interface RequestItem {
  id: number;
  type: RequestType;
  title: string;
  applicant: string;
  equipmentId?: number | null;
  priority: RequestPriority;
  status: RequestStatus;
  createdAt: string;
  equipmentName?: string | null;
  invNumber?: string | null;
}
