
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import AgentDashboard from '@/components/Dashboard/AgentDashboard';
import ChefAgenceDashboard from '@/components/Dashboard/ChefAgenceDashboard';
import AdminGeneralDashboard from '@/components/Dashboard/AdminGeneralDashboard';

const Dashboard = () => {
  const { user } = useAuth();

  const renderDashboard = () => {
    switch (user?.role) {
      case 'agent':
        return <AgentDashboard />;
      case 'chef_agence':
        return <ChefAgenceDashboard />;
      case 'admin_general':
      case 'sous_admin':
        return <AdminGeneralDashboard />;
      default:
        return (
          <div className="text-center py-12">
            <p className="text-gray-600">Tableau de bord non configuré pour ce rôle.</p>
          </div>
        );
    }
  };

  return (
    <div className="space-y-6">
      {renderDashboard()}
    </div>
  );
};

export default Dashboard;
