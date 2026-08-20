import { Navigate, Routes, Route } from "react-router-dom";
import { AdminDashboard } from "@/pages/admin/Dashboard";
import { SettingsPage } from "@/pages/admin/settings/SettingsPage";
import { CMSLayout } from "@/pages/admin/CMSLayout";
import UserManagement from "@/pages/admin/UserManagement";
import DeployDashboard from "@/pages/DeployDashboard";
import ChatBotsSettingsPage from "@/pages/admin/settings/ChatBotsSettingsPage";
import NewsManagementPage from "@/pages/admin/news/NewsManagementPage";
import NewsEditorPage from "@/pages/admin/news/NewsEditorPage";
import NewsCollaboratorsPage from "@/pages/admin/news/NewsCollaboratorsPage";
import PocketBaseTestPage from "@/pages/admin/PocketBaseTest";
import PocketBaseDashboard from "@/pages/admin/PocketBaseDashboard";
import { useAuth } from "@/hooks/useAuth";

export const AdminRoutes = () => {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated || !['master_admin', 'super_admin', 'admin'].includes(user?.role || '')) {
    return <Navigate to="/login" replace />;
  }

  return (
    <Routes>
      <Route element={<CMSLayout />}>
        <Route path="/" element={<AdminDashboard />} />
        <Route path="/dashboard" element={<AdminDashboard />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/users" element={<UserManagement />} />
        <Route path="/deploy" element={<DeployDashboard />} />
        <Route path="/chatbots" element={<ChatBotsSettingsPage />} />
        <Route path="/pocketbase-test" element={<PocketBaseTestPage />} />
        <Route path="/pocketbase" element={<PocketBaseDashboard />} />
        <Route path="/news" element={<NewsManagementPage />} />
        <Route path="/news/create" element={<NewsEditorPage />} />
        <Route path="/news/edit/:id" element={<NewsEditorPage />} />
        <Route path="/news/collaborators/:id" element={<NewsCollaboratorsPage />} />
      </Route>
    </Routes>
  );
};
