import { useCallback, useState } from 'react';
import type { FormEvent } from 'react';
import type { FormErrors } from '../utils/validation';

type Validator<T> = (values: T) => FormErrors;

export function useForm<T extends object>(
  initialValues: T,
  validate?: Validator<T>
) {
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);

  const setValue = useCallback(<K extends keyof T>(name: K, value: T[K]) => {
    setValues((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => (prev[name as string] ? { ...prev, [name as string]: '' } : prev));
  }, []);

  const replace = useCallback((next: T) => {
    setValues(next);
    setErrors({});
  }, []);

  const reset = useCallback(() => {
    setValues(initialValues);
    setErrors({});
  }, [initialValues]);

  const validateNow = useCallback((): boolean => {
    const nextErrors = validate ? validate(values) : {};
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }, [validate, values]);

  const submit = useCallback(
    (handler: (current: T) => Promise<void>) => async (event: FormEvent) => {
      event.preventDefault();
      if (!validateNow()) return;

      setSubmitting(true);
      try {
        await handler(values);
      } finally {
        setSubmitting(false);
      }
    },
    [validateNow, values]
  );

  return {
    values,
    errors,
    submitting,
    setValue,
    setErrors,
    replace,
    reset,
    validateNow,
    submit,
  };
}
