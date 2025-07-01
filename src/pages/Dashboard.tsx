import React, { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Rediriger automatiquement vers le dashboard spécifique du rôle
    if (user?.role) {
      const roleRoutes = {
        'agent': '/dashboard/agent',
        'chef_agence': '/dashboard/chef-agence',
        'admin_general': '/dashboard/admin',
        'sous_admin': '/dashboard/sous-admin',
        'developer': '/dashboard/developer'
      };

      const targetRoute = roleRoutes[user.role];
      if (targetRoute) {
        navigate(targetRoute, { replace: true });
      }
    }
  }, [user?.role, navigate]);

  // Affichage de chargement pendant la redirection
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-600">Redirection vers votre tableau de bord...</p>
      </div>
    </div>
  );
};

export default Dashboard;