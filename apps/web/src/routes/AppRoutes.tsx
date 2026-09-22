import {
  Navigate,
  Route,
  Routes,
} from 'react-router-dom';
import App from '../App';
import { AdminDashboardPage } from '../pages/AdminDashboardPage';
import { AdminExpensesPage } from '../pages/AdminExpensesPage';
import { AdminLoginPage } from '../pages/AdminLoginPage';
import { AdminParticipantsPage } from '../pages/AdminParticipantsPage';
import { AdminTransactionsPage } from '../pages/AdminTransactionsPage';

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
      <Route
        path="/admin/participants"
        element={<AdminParticipantsPage />}
      />
      <Route
        path="/admin/transactions"
        element={<AdminTransactionsPage />}
      />
      <Route
        path="/admin/expenses"
        element={<AdminExpensesPage />}
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
