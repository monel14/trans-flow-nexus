import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { 
  Home, 
  Plus, 
  Clock, 
  Settings,
  Users,
  FileText,
  CheckCircle,
  User
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const getMenuItems = () => {
    const baseItems = [
      { icon: Home, label: 'Tableau de Bord', path: '/dashboard' },
    ];

    switch (user?.role) {
      case 'agent':
        return [
          ...baseItems,
          { icon: Plus, label: 'Nouvelle Opération', path: '/operations/new' },
          { icon: Clock, label: 'Mes Opérations', path: '/operations/history' },
          { icon: FileText, label: 'Mes Commissions', path: '/commissions' },
          { icon: User, label: 'Demander Recharge', path: '/recharge' },
        ];
      
      case 'chef_agence':
        return [
          ...baseItems,
          { icon: Plus, label: 'Nouvelle Opération', path: '/operations/new' },
          { icon: Users, label: 'Mes Agents', path: '/agents' },
          { icon: CheckCircle, label: 'Recharges Agents', path: '/agent-recharges' },
          { icon: FileText, label: 'Mes Commissions', path: '/commissions' },
          { icon: User, label: 'Demander Recharge', path: '/recharge' },
        ];
      
      case 'admin_general':
        return [
          ...baseItems,
          { icon: CheckCircle, label: 'Validation Transactions', path: '/validation' },
          { icon: Users, label: 'Gestion Agences', path: '/agencies' },
          { icon: Users, label: 'Chefs d\'Agence', path: '/chefs-agence' },
          { icon: Users, label: 'Sous-Administrateurs', path: '/sub-admins' },
          { icon: FileText, label: 'Requêtes Support', path: '/support' },
          { icon: Settings, label: 'Configuration', path: '/config' },
        ];
      
      case 'sous_admin':
        return [
          ...baseItems,
          { icon: CheckCircle, label: 'Mes Validations', path: '/validation' },
          { icon: FileText, label: 'Mes Requêtes', path: '/support' },
        ];
      
      case 'developer':
        return [
          ...baseItems,
          { icon: Settings, label: 'Tableau de Bord Dév.', path: '/developer/dashboard' },
          { icon: Settings, label: 'Types d\'Opérations', path: '/developer/operation-types' },
          { icon: Settings, label: 'Configuration Système', path: '/system-config' },
          { icon: FileText, label: 'Journaux d\'Erreurs', path: '/error-logs' },
        ];
      
      default:
        return baseItems;
    }
  };

  const menuItems = getMenuItems();

  const handleNavigation = (path: string) => {
    navigate(path);
    onClose();
  };

  return (
    <>
      {/* Overlay pour mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <aside className={`
        fixed left-0 top-0 h-full w-64 bg-white border-r border-gray-200 z-50 transform transition-transform duration-300
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        md:translate-x-0 md:static md:z-auto
      `}>
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">TF</span>
            </div>
            <h2 className="text-lg font-bold text-gray-900">TransFlow</h2>
          </div>
        </div>

        <nav className="p-4">
          <div className="space-y-2">
            {menuItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Button
                  key={item.path}
                  variant={isActive ? "default" : "ghost"}
                  className={`w-full justify-start ${isActive ? 'bg-blue-600 text-white' : ''}`}
                  onClick={() => handleNavigation(item.path)}
                >
                  <item.icon className="h-4 w-4 mr-3" />
                  {item.label}
                </Button>
              );
            })}
          </div>
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;
