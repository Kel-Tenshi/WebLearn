import React, { useEffect, useState } from 'react';
import { Department, User } from '../../types';
import { directoryApi, userApi } from '../../api';
import { useAlert } from '../../context/AlertContext';
import { useForm } from '../../hooks/useForm';
import { FormField } from '../ui/FormField';
import { PasswordInput } from '../ui/PasswordInput';
import { collect, maxTextLength, requiredText } from '../../utils/validation';
import { roleLabel } from '../../utils/roles';

interface Props {
  user: User;
  onUserUpdated: (user: User) => void;
}

interface ProfileForm {
  fullName: string;
  departmentId: number;
}

interface PasswordForm {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

const validateProfile = (values: ProfileForm) =>
  collect({
    fullName: maxTextLength(values.fullName, 120, 'ФИО не должно превышать 120 символов'),
  });

const validatePassword = (values: PasswordForm) =>
  collect({
    currentPassword: requiredText(values.currentPassword, 'Введите текущий пароль'),
    newPassword:
      requiredText(values.newPassword, 'Введите новый пароль') ||
      (values.newPassword.trim().length < 6
        ? 'Пароль должен содержать минимум 6 символов'
        : undefined),
    confirmPassword:
      values.newPassword !== values.confirmPassword ? 'Пароли не совпадают' : undefined,
  });

export const ProfileTab: React.FC<Props> = ({ user, onUserUpdated }) => {
  const { showAlert, showApiError } = useAlert();
  const [departments, setDepartments] = useState<Department[]>([]);

  const profileForm = useForm<ProfileForm>(
    { fullName: user.fullName || '', departmentId: user.departmentId || 0 },
    validateProfile
  );

  const passwordForm = useForm<PasswordForm>(
    { currentPassword: '', newPassword: '', confirmPassword: '' },
    validatePassword
  );

  useEffect(() => {
    directoryApi
      .getDepartments()
      .then(setDepartments)
      .catch(() => setDepartments([]));
  }, []);

  const handleProfile = profileForm.submit(async (current) => {
    try {
      const updated = await userApi.updateProfile({
        fullName: current.fullName.trim() || null,
        departmentId: current.departmentId || null,
      });
      onUserUpdated(updated);
      profileForm.replace({
        fullName: updated.fullName || '',
        departmentId: updated.departmentId || 0,
      });
      showAlert('Профиль сохранён', 'success');
    } catch (error) {
      showApiError(error);
    }
  });

  const handlePassword = passwordForm.submit(async (current) => {
    try {
      await userApi.changePassword({
        currentPassword: current.currentPassword,
        newPassword: current.newPassword,
      });
      passwordForm.reset();
      showAlert('Пароль изменён. Остальные сессии завершены', 'success');
    } catch (error) {
      showApiError(error);
    }
  });

  return (
    <div className="tab-container">
      <h2>Профиль</h2>

      <div className="profile-grid">
        <section className="card">
          <h3>Личные данные</h3>

          <div className="profile-meta">
            <span>Логин</span>
            <b>{user.login}</b>
          </div>
          <div className="profile-meta">
            <span>Роль</span>
            <b>{roleLabel(user.role)}</b>
          </div>

          <form onSubmit={handleProfile} className="profile-form" noValidate>
            <FormField label="ФИО" error={profileForm.errors.fullName}>
              <input
                value={profileForm.values.fullName}
                placeholder="Иванов Иван Иванович"
                onChange={(e) => profileForm.setValue('fullName', e.target.value)}
              />
            </FormField>

            <FormField label="Подразделение">
              <select
                value={profileForm.values.departmentId}
                onChange={(e) =>
                  profileForm.setValue('departmentId', Number(e.target.value))
                }
              >
                <option value={0}>Без подразделения</option>
                {departments.map((department) => (
                  <option key={department.id} value={department.id}>
                    {department.code} — {department.name}
                  </option>
                ))}
              </select>
            </FormField>

            <button type="submit" className="primary" disabled={profileForm.submitting}>
              Сохранить профиль
            </button>
          </form>
        </section>

        <section className="card">
          <h3>Смена пароля</h3>
          <p className="muted">
            После смены пароля остальные сессии будут завершены, текущая — сохранится.
          </p>

          <form onSubmit={handlePassword} className="profile-form" noValidate>
            <FormField label="Текущий пароль" error={passwordForm.errors.currentPassword}>
              <PasswordInput
                value={passwordForm.values.currentPassword}
                ariaLabel="Текущий пароль"
                autoComplete="current-password"
                onChange={(value) => passwordForm.setValue('currentPassword', value)}
              />
            </FormField>

            <FormField label="Новый пароль" error={passwordForm.errors.newPassword}>
              <PasswordInput
                value={passwordForm.values.newPassword}
                ariaLabel="Новый пароль"
                autoComplete="new-password"
                onChange={(value) => passwordForm.setValue('newPassword', value)}
              />
            </FormField>

            <FormField label="Повторите новый пароль" error={passwordForm.errors.confirmPassword}>
              <PasswordInput
                value={passwordForm.values.confirmPassword}
                ariaLabel="Повторите новый пароль"
                autoComplete="new-password"
                onChange={(value) => passwordForm.setValue('confirmPassword', value)}
              />
            </FormField>

            <button type="submit" className="primary" disabled={passwordForm.submitting}>
              Сменить пароль
            </button>
          </form>
        </section>
      </div>
    </div>
  );
};
