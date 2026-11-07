// Клиентская копия карты переходов.
// Держим её в одном месте, чтобы таблицы и формы не собирали статусы вручную.

export type StatusKind = 'equipment' | 'request' | 'maintenance' | 'transfer' | 'order' | 'audit';

export interface StatusAction {
  to: string;
  label: string;
  tone: 'primary' | 'danger' | 'neutral';
}

const TRANSITIONS: Record<StatusKind, Record<string, string[]>> = {
  equipment: {
    'Работает': ['Простой', 'В ремонте', 'На консервации', 'Списано'],
    'Простой': ['Работает', 'В ремонте', 'На консервации', 'Списано'],
    'В ремонте': ['Работает', 'Простой', 'Списано'],
    'На консервации': ['Работает', 'Простой', 'Списано'],
    'Списано': [],
  },
  request: {
    'На согласовании': ['Одобрено', 'Отклонено', 'Отменено'],
    'Одобрено': ['В работе', 'Отменено'],
    'В работе': ['Выполнено', 'Отменено'],
    'Выполнено': [],
    'Отклонено': [],
    'Отменено': [],
  },
  maintenance: {
    'Запланировано': ['Ожидает запчастей', 'В процессе', 'Отменено'],
    'Ожидает запчастей': ['В процессе', 'Отменено'],
    'В процессе': ['Завершено', 'Отменено'],
    'Завершено': [],
    'Отменено': [],
  },
  transfer: {
    'В пути': ['Принято', 'Отклонено'],
    'Принято': [],
    'Отклонено': [],
  },
  order: {
    'Черновик': ['Согласован', 'Отменён'],
    'Согласован': ['В доставке', 'Отменён'],
    'В доставке': ['Получен', 'Отменён'],
    'Получен': [],
    'Отменён': [],
  },
  audit: {
    'В процессе': ['Завершена', 'Выявлены расхождения'],
    'Завершена': [],
    'Выявлены расхождения': [],
  },
};

const ACTION_LABELS: Record<StatusKind, Record<string, string>> = {
  equipment: {
    'Работает': 'В работу',
    'Простой': 'В простой',
    'В ремонте': 'В ремонт',
    'На консервации': 'На консервацию',
    'Списано': 'Списать',
  },
  request: {
    'Одобрено': 'Одобрить',
    'Отклонено': 'Отклонить',
    'В работе': 'В работу',
    'Выполнено': 'Выполнить',
    'Отменено': 'Отменить',
  },
  maintenance: {
    'В процессе': 'Начать',
    'Ожидает запчастей': 'Ждать запчасти',
    'Завершено': 'Завершить',
    'Отменено': 'Отменить',
  },
  transfer: {
    'Принято': 'Принять',
    'Отклонено': 'Отклонить',
  },
  order: {
    'Согласован': 'Согласовать',
    'В доставке': 'В доставку',
    'Получен': 'Получен',
    'Отменён': 'Отменить',
  },
  audit: {
    'Завершена': 'Завершить',
    'Выявлены расхождения': 'Расхождения',
  },
};

const DANGER_TARGETS = new Set([
  'Списано',
  'Отклонено',
  'Отменено',
  'Отменён',
  'Выявлены расхождения',
]);

export const EQUIPMENT_INITIAL_STATUSES = ['Работает', 'Простой', 'На консервации'];

export function getNextStatuses(kind: StatusKind, fromStatus: string): string[] {
  return TRANSITIONS[kind][fromStatus] || [];
}

export function getStatusActions(kind: StatusKind, fromStatus: string): StatusAction[] {
  return getNextStatuses(kind, fromStatus).map((to) => ({
    to,
    label: ACTION_LABELS[kind][to] || to,
    tone: DANGER_TARGETS.has(to) ? 'danger' : 'primary',
  }));
}

export type StatusTone = 'success' | 'warning' | 'danger' | 'info' | 'neutral';

const STATUS_TONES: Record<string, StatusTone> = {
  'Работает': 'success',
  'Простой': 'warning',
  'В ремонте': 'warning',
  'На консервации': 'info',
  'Списано': 'danger',

  'На согласовании': 'warning',
  'Одобрено': 'info',
  'В работе': 'warning',
  'Выполнено': 'success',
  'Отклонено': 'danger',
  'Отменено': 'danger',

  'Запланировано': 'info',
  'Ожидает запчастей': 'warning',
  'В процессе': 'warning',
  'Завершено': 'success',

  'В пути': 'warning',
  'Принято': 'success',

  'Черновик': 'neutral',
  'Согласован': 'info',
  'В доставке': 'warning',
  'Получен': 'success',
  'Отменён': 'danger',

  'Завершена': 'success',
  'Выявлены расхождения': 'danger',
};

export function getStatusTone(status: string): StatusTone {
  return STATUS_TONES[status] || 'neutral';
}
