import { isAdminRole, isManagerRole, roleLabel } from './roles';

describe('roles', () => {
  test('isManagerRole: manager и выше', () => {
    expect(isManagerRole('employee')).toBe(false);
    expect(isManagerRole('manager')).toBe(true);
    expect(isManagerRole('admin')).toBe(true);
    expect(isManagerRole('root')).toBe(true);
  });

  test('isAdminRole: только admin и root', () => {
    expect(isAdminRole('employee')).toBe(false);
    expect(isAdminRole('manager')).toBe(false);
    expect(isAdminRole('admin')).toBe(true);
    expect(isAdminRole('root')).toBe(true);
  });

  test('roleLabel: русские подписи всех ролей', () => {
    expect(roleLabel('employee')).toBe('Сотрудник');
    expect(roleLabel('manager')).toBe('Руководитель');
    expect(roleLabel('admin')).toBe('Администратор');
    expect(roleLabel('root')).toBe('Владелец системы');
  });
});
