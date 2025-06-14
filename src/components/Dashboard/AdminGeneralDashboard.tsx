
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, Users, FileText, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AdminGeneralDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Tableau de Bord - {user?.role === 'admin_general' ? 'Administrateur Général' : 'Sous-Administrateur'}
        </h1>
      </div>

      {/* Indicateurs globaux */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Volume Total (Aujourd'hui)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              8,750,000 FCFA
            </div>
            <div className="text-sm text-gray-500">+12% vs hier</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Opérations (Aujourd'hui)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              347
            </div>
            <div className="text-sm text-gray-500">156 validées, 12 en attente</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Agences Actives
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              15
            </div>
            <div className="text-sm text-gray-500">89 agents total</div>
          </CardContent>
        </Card>
      </div>

      {/* Files d'attente critiques */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-red-600">
            <AlertTriangle className="mr-2 h-5 w-5" />
            Files d'Attente Critiques
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-red-50 rounded-lg border border-red-200">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-red-900">
                  Transactions en Attente
                </span>
                <span className="bg-red-600 text-white text-sm px-2 py-1 rounded-full">
                  12
                </span>
              </div>
              <Button 
                size="sm" 
                onClick={() => navigate('/validation')}
                className="w-full"
              >
                <CheckCircle className="mr-2 h-4 w-4" />
                Traiter
              </Button>
            </div>

            <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-orange-900">
                  Requêtes Support
                </span>
                <span className="bg-orange-600 text-white text-sm px-2 py-1 rounded-full">
                  7
                </span>
              </div>
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => navigate('/support')}
                className="w-full"
              >
                <FileText className="mr-2 h-4 w-4" />
                Voir
              </Button>
            </div>

            <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-yellow-900">
                  Recharges Chefs d'Agence
                </span>
                <span className="bg-yellow-600 text-white text-sm px-2 py-1 rounded-full">
                  3
                </span>
              </div>
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => navigate('/agencies')}
                className="w-full"
              >
                <Users className="mr-2 h-4 w-4" />
                Gérer
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminGeneralDashboard;
