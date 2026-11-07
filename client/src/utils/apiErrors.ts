import { ApiError } from '../api/http';

export type ErrorTone = 'danger' | 'warning' | 'info';

export interface ErrorDescription {
  status: number;
  title: string;
  message: string;
  tone: ErrorTone;
}

const STATUS_INFO: Record<number, Omit<ErrorDescription, 'status'>> = {
  0: {
    title: 'Сервер недоступен',
    message: 'Не удалось связаться с сервером. Проверьте подключение к сети и попробуйте ещё раз.',
    tone: 'danger',
  },
  400: {
    title: 'Некорректный запрос',
    message: 'Сервер отклонил запрос. Проверьте введённые данные и попробуйте снова.',
    tone: 'warning',
  },
  401: {
    title: 'Требуется авторизация',
    message: 'Сессия истекла или вы не вошли в систему. Войдите заново, чтобы продолжить.',
    tone: 'info',
  },
  403: {
    title: 'Доступ запрещён',
    message: 'У вашей роли недостаточно прав для этого раздела или действия.',
    tone: 'warning',
  },
  404: {
    title: 'Не найдено',
    message: 'Запрошенный ресурс не существует или был удалён.',
    tone: 'info',
  },
  409: {
    title: 'Конфликт данных',
    message: 'Данные уже изменились или запись с такими значениями существует. Обновите страницу и попробуйте снова.',
    tone: 'warning',
  },
  413: {
    title: 'Слишком большой запрос',
    message: 'Размер отправленных данных превышает допустимый.',
    tone: 'warning',
  },
  422: {
    title: 'Ошибка валидации',
    message: 'Проверьте заполнение полей и попробуйте снова.',
    tone: 'warning',
  },
  429: {
    title: 'Слишком много запросов',
    message: 'Подождите немного и повторите попытку.',
    tone: 'warning',
  },
  500: {
    title: 'Ошибка сервера',
    message: 'На сервере произошла непредвиденная ошибка. Попробуйте повторить запрос позже.',
    tone: 'danger',
  },
  502: {
    title: 'Сервис недоступен',
    message: 'Сервер временно недоступен. Попробуйте повторить запрос позже.',
    tone: 'danger',
  },
  503: {
    title: 'Сервис недоступен',
    message: 'Сервер временно недоступен. Попробуйте повторить запрос позже.',
    tone: 'danger',
  },
  504: {
    title: 'Сервер не отвечает',
    message: 'Превышено время ожидания ответа. Попробуйте повторить запрос позже.',
    tone: 'danger',
  },
};

const FALLBACK: Omit<ErrorDescription, 'status'> = {
  title: 'Неизвестная ошибка',
  message: 'Не удалось выполнить запрос. Попробуйте обновить страницу.',
  tone: 'danger',
};

export function describeStatus(status: number): ErrorDescription {
  const info = STATUS_INFO[status] || (status >= 500 ? STATUS_INFO[500] : FALLBACK);
  return { status, ...info };
}

export function describeError(error: unknown, statusOverride?: number): ErrorDescription {
  const detectedStatus = error instanceof ApiError ? error.status : error instanceof Error ? 500 : 0;
  const status = statusOverride ?? detectedStatus;
  const info = describeStatus(status);

  // Для 4xx показываем уточнение от сервера, для 5xx — только безопасный общий текст
  const serverMessage = error instanceof ApiError ? error.message : '';
  const message =
    status >= 400 && status < 500 && serverMessage.trim() ? serverMessage : info.message;

  return { ...info, message };
}
