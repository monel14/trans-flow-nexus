import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Database, RefreshCw, Users, Building, MessageSquare, DollarSign } from 'lucide-react';

const TestDataGenerator = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);

  const generateCommissionData = async () => {
    if (!user?.id) return;

    try {
      // Créer quelques enregistrements de commissions fictives
      const commissionsData = [
        {
          agent_id: user.id,
          agent_commission: 5000,
          chef_commission: 2000,
          total_commission: 7000,
          status: 'paid',
          commission_rule_id: '550e8400-e29b-41d4-a716-446655440000', // UUID fictif
          operation_id: '550e8400-e29b-41d4-a716-446655440001',
          paid_at: new Date().toISOString()
        },
        {
          agent_id: user.id,
          agent_commission: 3000,
          chef_commission: 1500,
          total_commission: 4500,
          status: 'pending',
          commission_rule_id: '550e8400-e29b-41d4-a716-446655440000',
          operation_id: '550e8400-e29b-41d4-a716-446655440002'
        },
        {
          agent_id: user.id,
          agent_commission: 7500,
          chef_commission: 3000,
          total_commission: 10500,
          status: 'paid',
          commission_rule_id: '550e8400-e29b-41d4-a716-446655440000',
          operation_id: '550e8400-e29b-41d4-a716-446655440003',
          paid_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
        }
      ];

      const { error } = await supabase
        .from('commission_records')
        .insert(commissionsData);

      if (error) throw error;

      toast({
        title: "Données de commissions créées",
        description: "3 enregistrements de commissions fictives ont été ajoutés",
      });
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: `Erreur lors de la création des commissions: ${error.message}`,
        variant: "destructive",
      });
    }
  };

  const generateRechargeRequests = async () => {
    if (!user?.id) return;

    try {
      const rechargeData = [
        {
          ticket_number: `RCH-${Date.now()}-1`,
          ticket_type: 'recharge',
          title: 'Demande de recharge pour opérations urgentes',
          description: 'J\'ai besoin d\'une recharge pour traiter plusieurs opérations importantes pour mes clients.',
          requested_amount: 100000,
          priority: 'high',
          status: 'open',
          requester_id: user.id
        },
        {
          ticket_number: `RCH-${Date.now()}-2`,
          ticket_type: 'recharge',
          title: 'Recharge mensuelle habituelle',
          description: 'Demande de recharge mensuelle pour continuer les activités.',
          requested_amount: 50000,
          priority: 'medium',
          status: 'resolved',
          requester_id: user.id,
          resolved_at: new Date().toISOString(),
          resolution_notes: 'Recharge approuvée et effectuée'
        }
      ];

      const { error } = await supabase
        .from('request_tickets')
        .insert(rechargeData);

      if (error) throw error;

      toast({
        title: "Demandes de recharge créées",
        description: "2 demandes de recharge fictives ont été ajoutées",
      });
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: `Erreur lors de la création des demandes: ${error.message}`,
        variant: "destructive",
      });
    }
  };

  const generateSupportTickets = async () => {
    if (!user?.id) return;

    try {
      const supportData = [
        {
          ticket_number: `SUP-${Date.now()}-1`,
          ticket_type: 'support',
          title: 'Problème de connexion à l\'application',
          description: 'Je rencontre des difficultés pour me connecter depuis hier soir.',
          priority: 'high',
          status: 'open',
          requester_id: user.id
        },
        {
          ticket_number: `SUP-${Date.now()}-2`,
          ticket_type: 'feature_request',
          title: 'Demande d\'amélioration des rapports',
          description: 'Il serait utile d\'avoir des graphiques plus détaillés dans les rapports.',
          priority: 'low',
          status: 'in_progress',
          requester_id: user.id
        }
      ];

      const { error } = await supabase
        .from('request_tickets')
        .insert(supportData);

      if (error) throw error;

      toast({
        title: "Tickets de support créés",
        description: "2 tickets de support fictifs ont été ajoutés",
      });
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: `Erreur lors de la création des tickets: ${error.message}`,
        variant: "destructive",
      });
    }
  };

  const generateAgencies = async () => {
    try {
      const agenciesData = [
        {
          name: 'Agence Dakar Centre',
          city: 'Dakar',
          chef_agence_id: user?.id
        },
        {
          name: 'Agence Thiès Nord',
          city: 'Thiès'
        },
        {
          name: 'Agence Saint-Louis',
          city: 'Saint-Louis'
        }
      ];

      const { error } = await supabase
        .from('agencies')
        .insert(agenciesData);

      if (error) throw error;

      toast({
        title: "Agences créées",
        description: "3 agences fictives ont été ajoutées",
      });
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: `Erreur lors de la création des agences: ${error.message}`,
        variant: "destructive",
      });
    }
  };

  const updateUserBalance = async () => {
    if (!user?.id) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ balance: 250000 })
        .eq('id', user.id);

      if (error) throw error;

      // Créer un enregistrement dans le ledger
      const { error: ledgerError } = await supabase
        .from('transaction_ledger')
        .insert({
          user_id: user.id,
          transaction_type: 'test_credit',
          amount: 250000,
          balance_before: 0,
          balance_after: 250000,
          description: 'Crédit fictif pour les tests'
        });

      if (ledgerError) console.error('Ledger error:', ledgerError);

      toast({
        title: "Solde mis à jour",
        description: "Votre solde a été mis à 250,000 XOF pour les tests",
      });
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: `Erreur lors de la mise à jour du solde: ${error.message}`,
        variant: "destructive",
      });
    }
  };

  const generateAllTestData = async () => {
    setIsGenerating(true);
    
    try {
      await updateUserBalance();
      await generateAgencies();
      await generateCommissionData();
      await generateRechargeRequests();
      await generateSupportTickets();
      
      toast({
        title: "Données de test générées",
        description: "Toutes les données fictives ont été créées avec succès !",
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Erreur lors de la génération des données de test",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  if (user?.role !== 'developer') {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-gray-500">
            Cette section est réservée aux développeurs
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Générateur de Données de Test
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Button
              onClick={updateUserBalance}
              variant="outline"
              className="flex items-center gap-2"
            >
              <DollarSign className="h-4 w-4" />
              Créditer Solde (250k XOF)
            </Button>

            <Button
              onClick={generateAgencies}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Building className="h-4 w-4" />
              Créer Agences
            </Button>

            <Button
              onClick={generateCommissionData}
              variant="outline"
              className="flex items-center gap-2"
            >
              <DollarSign className="h-4 w-4" />
              Créer Commissions
            </Button>

            <Button
              onClick={generateRechargeRequests}
              variant="outline"
              className="flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Créer Demandes Recharge
            </Button>

            <Button
              onClick={generateSupportTickets}
              variant="outline"
              className="flex items-center gap-2"
            >
              <MessageSquare className="h-4 w-4" />
              Créer Tickets Support
            </Button>

            <Button
              onClick={generateAllTestData}
              disabled={isGenerating}
              className="flex items-center gap-2"
            >
              <Database className="h-4 w-4" />
              {isGenerating ? 'Génération...' : 'Tout Générer'}
            </Button>
          </div>

          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">Instructions :</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Utilisez "Tout Générer" pour créer rapidement un jeu de données complet</li>
              <li>• Ou cliquez sur chaque bouton individuellement pour des données spécifiques</li>
              <li>• Ces données sont fictives et destinées uniquement aux tests</li>
              <li>• Vous pouvez regénérer les données autant de fois que nécessaire</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TestDataGenerator;