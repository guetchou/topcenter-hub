import React from 'react';
import { NavLink } from 'react-router-dom';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Users,
  Settings,
  Rocket,
  Bot,
  Newspaper,
  Database
} from 'lucide-react';

export interface AdminNavLinksProps {
  closeMobileMenu?: () => void;
}

export const AdminNavLinks: React.FC<AdminNavLinksProps> = ({
  closeMobileMenu = () => {},
}) => {
  const isActiveClass = ({ isActive }: { isActive: boolean }) =>
    cn(
      'flex items-center gap-3 rounded-lg px-3 py-2 transition-all',
      isActive
        ? 'bg-primary text-primary-foreground'
        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
    );

  return (
    <nav className="space-y-1">
      <NavLink
        to="/admin/dashboard"
        className={isActiveClass}
        onClick={closeMobileMenu}
      >
        <LayoutDashboard className="h-5 w-5" />
        <span>Dashboard</span>
      </NavLink>
      <NavLink
        to="/admin/users"
        className={isActiveClass}
        onClick={closeMobileMenu}
      >
        <Users className="h-5 w-5" />
        <span>Utilisateurs</span>
      </NavLink>
      <NavLink
        to="/admin/settings"
        className={isActiveClass}
        onClick={closeMobileMenu}
      >
        <Settings className="h-5 w-5" />
        <span>Paramètres</span>
      </NavLink>
      <NavLink
        to="/admin/deploy"
        className={isActiveClass}
        onClick={closeMobileMenu}
      >
        <Rocket className="h-5 w-5" />
        <span>Déploiement</span>
      </NavLink>
      <NavLink
        to="/admin/chatbots"
        className={isActiveClass}
        onClick={closeMobileMenu}
      >
        <Bot className="h-5 w-5" />
        <span>Chatbots</span>
      </NavLink>
      <NavLink
        to="/admin/news"
        className={isActiveClass}
        onClick={closeMobileMenu}
      >
        <Newspaper className="h-5 w-5" />
        <span>Actualités</span>
      </NavLink>
      <NavLink
        to="/admin/pocketbase"
        className={isActiveClass}
        onClick={closeMobileMenu}
      >
        <Database className="h-5 w-5" />
        <span>PocketBase</span>
      </NavLink>
    </nav>
  );
};

export default AdminNavLinks;
