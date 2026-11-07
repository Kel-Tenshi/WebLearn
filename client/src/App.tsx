import React, { useCallback, useEffect, useState } from 'react';
import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { userApi, authApi, ApiError } from './api';
import { User } from './types';
import { Navbar } from './components/layout/Navbar';
import { LoginView } from './components/auth/LoginView';
import { RegisterView } from './components/auth/RegisterView';
import { HomeTab } from './components/home/HomeTab';
import { EquipmentTab } from './components/equipment/EquipmentTab';
import { RequestsTab } from './components/requests/RequestsTab';
import { OperationsTab } from './components/operations/OperationsTab';
import { DirectoryTab } from './components/directory/DirectoryTab';
import { AuditsTab } from './components/directory/AuditsTab';
import { UsersTab } from './components/users/UsersTab';
import { NotFoundView } from './components/layout/NotFoundView';
import { ErrorView } from './components/layout/ErrorView';
import { Loading } from './components/ui/Loading';

function ProtectedLayout({ user, onLogout }: { user: User | null; onLogout: () => void }) {
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <>
      <Navbar user={user} onLogout={onLogout} />
      <main>
        <Outlet />
      </main>
    </>
  );
}

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [sessionError, setSessionError] = useState<unknown>(null);

  const loadSession = useCallback(() => {
    setLoading(true);
    setSessionError(null);

    userApi
      .getMe()
      .then((data) => setUser(data))
      .catch((error) => {
        // 401 — это нормальная ситуация «не авторизован», остальное показываем страницей
        if (error instanceof ApiError && error.status === 401) {
          setUser(null);
          return;
        }
        setSessionError(error);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    loadSession();
  }, [loadSession]);

  // Глобальная реакция на истёкшую сессию после неудачного refresh
  useEffect(() => {
    const handleExpired = () => setUser(null);
    window.addEventListener('auth:expired', handleExpired);
    return () => window.removeEventListener('auth:expired', handleExpired);
  }, []);

  const handleLogout = async () => {
    try {
      await authApi.logout();
    } catch (e) {
      // Игнорируем ошибки сети при выходе
    } finally {
      setUser(null);
    }
  };

  if (loading) {
    return (
      <div className="tab-container">
        <Loading label="Загрузка сессии…" />
      </div>
    );
  }

  if (sessionError) {
    return <ErrorView error={sessionError} onRetry={loadSession} />;
  }

  return (
    <Routes>
      {/* Маршруты авторизации: если уже вошел — отправляем на главную */}
      <Route
        path="/login"
        element={user ? <Navigate to="/" replace /> : <LoginView onSuccess={setUser} />}
      />
      <Route
        path="/register"
        element={user ? <Navigate to="/" replace /> : <RegisterView onSuccess={setUser} />}
      />

      {/* Защищенная зона приложения */}
      {user ? (
        <Route element={<ProtectedLayout user={user} onLogout={handleLogout} />}>
          <Route index element={<HomeTab user={user} />} />
          <Route path="equipment" element={<EquipmentTab user={user} />} />
          <Route path="requests" element={<RequestsTab user={user} />} />
          <Route path="operations" element={<Navigate to="/operations/maintenance" replace />} />
          <Route path="operations/:section" element={<OperationsTab user={user} />} />
          <Route path="directory" element={<DirectoryTab user={user} />} />
          <Route path="audits" element={<AuditsTab user={user} />} />
          <Route
            path="users"
            element={
              user.role === 'admin' ? (
                <UsersTab currentUser={user} />
              ) : (
                <ErrorView
                  status={403}
                  message="Раздел «Пользователи» доступен только администратору."
                />
              )
            }
          />
          {/* Кастомная страница 404 для авторизованного пользователя с учетом его роли */}
          <Route path="*" element={<NotFoundView user={user} />} />
        </Route>
      ) : (
        /* Если не авторизован — любой неизвестный URL отправляет на /login */
        <Route path="*" element={<Navigate to="/login" replace />} />
      )}
    </Routes>
  );
}

export default App;
