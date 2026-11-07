import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { userApi, authApi } from './api';
import { User } from './types';
import { Navbar } from './components/layout/Navbar';
import { LoginView } from './components/auth/LoginView';
import { RegisterView } from './components/auth/RegisterView';
import { EquipmentTab } from './components/equipment/EquipmentTab';
import { RequestsTab } from './components/requests/RequestsTab';
import { OperationsTab } from './components/OperationsTab';
import { DirectoryTab } from './components/DirectoryTab';
import { UsersTab } from './components/UsersTab';
import { NotFoundView } from './components/layout/NotFoundView';

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

  useEffect(() => {
    userApi.getMe()
      .then((data) => setUser(data))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
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
    return <div style={{ padding: 32, textAlign: 'center' }}>Загрузка сессии...</div>;
  }

  return (
    <Routes>
      {/* Маршруты авторизации: если уже вошел — отправляем к оборудованию */}
      <Route
        path="/login"
        element={user ? <Navigate to="/equipment" replace /> : <LoginView onSuccess={setUser} />}
      />
      <Route
        path="/register"
        element={user ? <Navigate to="/equipment" replace /> : <RegisterView onSuccess={setUser} />}
      />

      {/* Защищенная зона приложения */}
      {user ? (
        <Route element={<ProtectedLayout user={user} onLogout={handleLogout} />}>
          <Route index element={<Navigate to="/equipment" replace />} />
          <Route path="equipment" element={<EquipmentTab user={user} />} />
          <Route path="requests" element={<RequestsTab user={user} />} />
          <Route path="operations" element={<OperationsTab user={user} />} />
          <Route path="directory" element={<DirectoryTab user={user} />} />
          {user.role === 'admin' && (
            <Route path="users" element={<UsersTab currentUser={user} />} />
          )}
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