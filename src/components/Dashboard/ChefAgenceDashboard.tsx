
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Users, Bell, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ChefAgenceDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Tableau de Bord - Chef d'Agence
        </h1>
        <p className="text-gray-600">{user?.agenceName}</p>
      </div>

      {/* Statuts personnels */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Mon Solde
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
              Volume Agence (Mois)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              2,450,000 FCFA
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Commissions Agence
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              125,000 FCFA
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Agents Actifs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              8
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alertes et actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-orange-600">
              <AlertTriangle className="mr-2 h-5 w-5" />
              Alertes & Actions Requises
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="p-3 bg-orange-50 rounded-lg border border-orange-200">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Demandes de Recharge en Attente</span>
                <span className="bg-orange-600 text-white text-xs px-2 py-1 rounded-full">3</span>
              </div>
              <Button 
                size="sm" 
                className="mt-2"
                onClick={() => navigate('/agent-recharges')}
              >
                Traiter maintenant
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Actions Rapides</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button 
              onClick={() => navigate('/operations/new')}
              className="w-full justify-start"
            >
              <Plus className="mr-2 h-4 w-4" />
              Nouvelle Opération (Personnelle)
            </Button>
            <Button 
              variant="outline"
              onClick={() => navigate('/agents')}
              className="w-full justify-start"
            >
              <Users className="mr-2 h-4 w-4" />
              Gérer mes Agents
            </Button>
            <Button 
              variant="outline"
              onClick={() => navigate('/recharge')}
              className="w-full justify-start"
            >
              Demander une Recharge (Admin)
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ChefAgenceDashboard;
