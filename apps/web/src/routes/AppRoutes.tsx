import {
  Navigate,
  Route,
  Routes,
} from 'react-router-dom';
import App from '../App';
import { AdminDashboardPage } from '../pages/AdminDashboardPage';
import { AdminLoginPage } from '../pages/AdminLoginPage';

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<App />} />
      <Route
        path="/admin/login"
        element={<AdminLoginPage />}
      />
      <Route
        path="/admin"
        element={<AdminDashboardPage />}
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
