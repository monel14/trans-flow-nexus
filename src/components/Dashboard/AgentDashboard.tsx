
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Clock, Bell } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AgentDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Données mockées pour la démonstration
  const recentOperations = [
    { id: '001', date: '2024-01-15', type: 'Transfert Western Union', amount: 50000, status: 'Validée' },
    { id: '002', date: '2024-01-15', type: 'Paiement Orange Money', amount: 25000, status: 'En attente' },
    { id: '003', date: '2024-01-14', type: 'Recharge Moov', amount: 10000, status: 'Validée' },
  ];

  const notifications = [
    'Transaction #001 validée par Admin',
    'Recharge de 100,000 FCFA approuvée',
    'Nouvelle commission disponible'
  ];

  return (
    <div className="space-y-6">
      {/* En-tête de bienvenue */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Bonjour, {user?.name}
        </h1>
        <p className="text-gray-600">{user?.agenceName}</p>
      </div>

      {/* Cartes de statut */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Solde Actuel
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {user?.balance?.toLocaleString()} FCFA
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Commissions du Mois
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              15,750 FCFA
            </div>
            <div className="text-sm text-gray-500">Estimées</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Commissions Totales Dues
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {user?.commissions?.toLocaleString()} FCFA
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Actions rapides */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Button 
          onClick={() => navigate('/operations/new')}
          className="h-16 text-lg"
        >
          <Plus className="mr-2 h-5 w-5" />
          Nouvelle Opération
        </Button>
        <Button 
          variant="outline"
          onClick={() => navigate('/recharge')}
          className="h-16 text-lg"
        >
          Demander une Recharge de Solde
        </Button>
      </div>

      {/* Contenu en deux colonnes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Dernières opérations */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center">
              <Clock className="mr-2 h-5 w-5" />
              Dernières Opérations
            </CardTitle>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => navigate('/operations/history')}
            >
              Voir tout
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentOperations.map((op) => (
                <div key={op.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-sm">{op.type}</p>
                    <p className="text-xs text-gray-500">{op.date}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{op.amount.toLocaleString()} FCFA</p>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      op.status === 'Validée' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {op.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Notifications récentes */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Bell className="mr-2 h-5 w-5" />
              Notifications Récentes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {notifications.map((notification, index) => (
                <div key={index} className="p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-900">{notification}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AgentDashboard;
