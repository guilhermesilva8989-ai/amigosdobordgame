import {
  Navigate,
  Route,
  Routes,
} from 'react-router-dom';
import App from '../App';
import { AdminDashboardPage } from '../pages/AdminDashboardPage';
import { AdminExpensesPage } from '../pages/AdminExpensesPage';
import { AdminFinancialGoalPage } from '../pages/AdminFinancialGoalPage';
import { AdminLoginPage } from '../pages/AdminLoginPage';
import { AdminParticipantsPage } from '../pages/AdminParticipantsPage';
import { AdminSiteSettingsPage } from '../pages/AdminSiteSettingsPage';
import { AdminTransactionsPage } from '../pages/AdminTransactionsPage';
import { AdminTransactionHistoryPage } from '../pages/AdminTransactionHistoryPage';

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
        path="/admin/transactions/history"
        element={<AdminTransactionHistoryPage />}
      />
      <Route
        path="/admin/expenses"
        element={<AdminExpensesPage />}
      />
      <Route
        path="/admin/financial-goal"
        element={<AdminFinancialGoalPage />}
      />
      <Route
        path="/admin/site-settings"
        element={<AdminSiteSettingsPage />}
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
