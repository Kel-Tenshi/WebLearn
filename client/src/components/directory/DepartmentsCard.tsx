import React from 'react';
import { Department } from '../../types';
import { FormField } from '../ui/FormField';
import { useForm } from '../../hooks/useForm';
import { collect, minTextLength, requiredText } from '../../utils/validation';

interface Props {
  items: Department[];
  canManage: boolean;
  onCreate: (data: { name: string; code: string }) => Promise<void>;
}

interface FormState {
  name: string;
  code: string;
}

const EMPTY_FORM: FormState = { name: '', code: '' };

const validateDepartment = (values: FormState) =>
  collect({
    code:
      requiredText(values.code, 'Укажите код подразделения') ||
      minTextLength(values.code, 2, 'Код должен содержать минимум 2 символа'),
    name:
      requiredText(values.name, 'Укажите название подразделения') ||
      minTextLength(values.name, 2, 'Название должно содержать минимум 2 символа'),
  });

export const DepartmentsCard: React.FC<Props> = ({ items, canManage, onCreate }) => {
  const { values, errors, submitting, setValue, reset, submit } =
    useForm<FormState>(EMPTY_FORM, validateDepartment);

  const handleSubmit = submit(async (current) => {
    try {
      await onCreate({ name: current.name.trim(), code: current.code.trim() });
      reset();
    } catch {
      // Ошибку уже показал родительский компонент
    }
  });

  return (
    <div className="card">
      <h4>Подразделения</h4>
      {canManage && (
        <form onSubmit={handleSubmit} className="form-row" noValidate>
          <FormField error={errors.code}>
            <input
              placeholder="Код"
              value={values.code}
              onChange={(e) => setValue('code', e.target.value)}
            />
          </FormField>
          <FormField error={errors.name}>
            <input
              placeholder="Название"
              value={values.name}
              onChange={(e) => setValue('name', e.target.value)}
            />
          </FormField>
          <button type="submit" disabled={submitting}>+</button>
        </form>
      )}
      <ul>
        {items.map((item) => (
          <li key={item.id}><code>{item.code}</code> — {item.name}</li>
        ))}
      </ul>
    </div>
  );
};
