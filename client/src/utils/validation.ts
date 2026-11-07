// Небольшие функции валидации, чтобы формы не повторяли одни и те же проверки.

export type FieldError = string | undefined;
export type FormErrors = Record<string, string>;

export function requiredText(value: string, message = 'Заполните поле'): FieldError {
  return value.trim() ? undefined : message;
}

export function minTextLength(
  value: string,
  min: number,
  message: string
): FieldError {
  return value.trim().length >= min ? undefined : message;
}

export function maxTextLength(
  value: string,
  max: number,
  message: string
): FieldError {
  return value.trim().length <= max ? undefined : message;
}

export function nonNegativeNumber(
  value: number,
  message = 'Значение не может быть меньше 0'
): FieldError {
  return Number.isFinite(value) && value >= 0 ? undefined : message;
}

export function collect(errors: Record<string, FieldError>): FormErrors {
  return Object.entries(errors).reduce<FormErrors>((acc, [field, error]) => {
    if (error) acc[field] = error;
    return acc;
  }, {});
}
