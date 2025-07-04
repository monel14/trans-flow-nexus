
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Database, RefreshCw, Users, Building, MessageSquare, DollarSign, Zap } from 'lucide-react';

const TestDataGenerator = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);

  const generateOperationTypes = async () => {
    if (!user?.id) return;

    try {
      // Créer des types d'opérations de base
      const operationTypesData = [
        {
          name: 'Transfert d\'argent',
          description: 'Transfert d\'argent entre particuliers',
          impacts_balance: true,
          is_active: true,
          status: 'active',
          created_by: user.id,
          updated_by: user.id
        },
        {
          name: 'Paiement facture',
          description: 'Paiement de factures (électricité, eau, téléphone)',
          impacts_balance: true,
          is_active: true,
          status: 'active',
          created_by: user.id,
          updated_by: user.id
        },
        {
          name: 'Recharge mobile',
          description: 'Recharge de crédit téléphonique',
          impacts_balance: true,
          is_active: true,
          status: 'active',
          created_by: user.id,
          updated_by: user.id
        }
      ];

      const { data: operationTypes, error: operationTypesError } = await supabase
        .from('operation_types')
        .insert(operationTypesData)
        .select();

      if (operationTypesError) throw operationTypesError;

      // Créer des règles de commission pour chaque type d'opération
      if (operationTypes && operationTypes.length > 0) {
        const commissionRulesData = operationTypes.map(ot => ({
          operation_type_id: ot.id,
          commission_type: 'percentage',
          percentage_rate: 0.025, // 2.5%
          min_amount: 100,
          max_amount: 1000000,
          is_active: true
        }));

        const { error: commissionError } = await supabase
          .from('commission_rules')
          .insert(commissionRulesData);

        if (commissionError) console.error('Erreur commissions:', commissionError);
      }

      toast({
        title: "Types d'opérations créés",
        description: "3 types d'opérations avec règles de commission ont été ajoutés",
      });
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: `Erreur lors de la création des types d'opérations: ${error.message}`,
        variant: "destructive",
      });
    }
  };

  const generateOperations = async () => {
    if (!user?.id) return;

    try {
      // Récupérer les types d'opérations existants
      const { data: operationTypes, error: opTypesError } = await supabase
        .from('operation_types')
        .select('id, name')
        .eq('is_active', true)
        .limit(1);

      if (opTypesError || !operationTypes || operationTypes.length === 0) {
        throw new Error('Aucun type d\'opération trouvé. Créez d\'abord des types d\'opérations.');
      }

      // Récupérer une agence existante
      const { data: agencies, error: agenciesError } = await supabase
        .from('agencies')
        .select('id')
        .limit(1);

      if (agenciesError || !agencies || agencies.length === 0) {
        throw new Error('Aucune agence trouvée. Créez d\'abord des agences.');
      }

      const operationsData = [
        {
          reference_number: `OP-${Date.now()}-1`,
          operation_type_id: operationTypes[0].id,
          initiator_id: user.id,
          agency_id: agencies[0].id,
          amount: 25000,
          currency: 'XOF',
          operation_data: {
            destinataire: 'Jean Dupont',
            telephone: '+221701234567',
            motif: 'Aide familiale'
          },
          status: 'completed',
          fee_amount: 500,
          commission_amount: 625,
          completed_at: new Date().toISOString()
        },
        {
          reference_number: `OP-${Date.now()}-2`,
          operation_type_id: operationTypes[0].id,
          initiator_id: user.id,
          agency_id: agencies[0].id,
          amount: 50000,
          currency: 'XOF',
          operation_data: {
            destinataire: 'Marie Sall',
            telephone: '+221709876543',
            motif: 'Paiement fournisseur'
          },
          status: 'pending',
          fee_amount: 750,
          commission_amount: 1250
        },
        {
          reference_number: `OP-${Date.now()}-3`,
          operation_type_id: operationTypes[0].id,
          initiator_id: user.id,
          agency_id: agencies[0].id,
          amount: 15000,
          currency: 'XOF',
          operation_data: {
            destinataire: 'Amadou Ba',
            telephone: '+221785432109',
            motif: 'Transfert urgent'
          },
          status: 'validated',
          fee_amount: 300,
          commission_amount: 375,
          validated_at: new Date().toISOString()
        }
      ];

      const { error } = await supabase
        .from('operations')
        .insert(operationsData);

      if (error) throw error;

      toast({
        title: "Opérations créées",
        description: "3 opérations fictives ont été ajoutées",
      });
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: `Erreur lors de la création des opérations: ${error.message}`,
        variant: "destructive",
      });
    }
  };

  const generateCommissionData = async () => {
    if (!user?.id) return;

    try {
      // Récupérer des opérations existantes
      const { data: operations, error: operationsError } = await supabase
        .from('operations')
        .select('id')
        .limit(3);

      if (operationsError || !operations || operations.length === 0) {
        throw new Error('Aucune opération trouvée. Créez d\'abord des opérations.');
      }

      // Récupérer une règle de commission
      const { data: commissionRules, error: rulesError } = await supabase
        .from('commission_rules')
        .select('id')
        .eq('is_active', true)
        .limit(1);

      if (rulesError || !commissionRules || commissionRules.length === 0) {
        throw new Error('Aucune règle de commission trouvée.');
      }

      const commissionsData = operations.map((op, index) => ({
        operation_id: op.id,
        commission_rule_id: commissionRules[0].id,
        agent_id: user.id,
        agent_commission: [5000, 3000, 7500][index] || 5000,
        chef_commission: [2000, 1500, 3000][index] || 2000,
        total_commission: [7000, 4500, 10500][index] || 7000,
        status: index === 0 ? 'paid' : 'pending',
        paid_at: index === 0 ? new Date().toISOString() : null
      }));

      const { error } = await supabase
        .from('commission_records')
        .insert(commissionsData);

      if (error) throw error;

      toast({
        title: "Données de commissions créées",
        description: `${commissionsData.length} enregistrements de commissions fictives ont été ajoutés`,
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
          requester_id: user.id,
          requested_amount: 100000,
          priority: 'high',
          status: 'open'
        },
        {
          ticket_number: `RCH-${Date.now()}-2`,
          ticket_type: 'recharge',
          title: 'Recharge mensuelle habituelle',
          description: 'Demande de recharge mensuelle pour continuer les activités.',
          requester_id: user.id,
          requested_amount: 50000,
          priority: 'medium',
          status: 'resolved',
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
          requester_id: user.id,
          priority: 'high',
          status: 'open'
        },
        {
          ticket_number: `SUP-${Date.now()}-2`,
          ticket_type: 'feature_request',
          title: 'Demande d\'amélioration des rapports',
          description: 'Il serait utile d\'avoir des graphiques plus détaillés dans les rapports.',
          requester_id: user.id,
          priority: 'low',
          status: 'in_progress'
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
          transaction_type: 'credit',
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
      await generateOperationTypes();
      await generateOperations();
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
              onClick={generateOperationTypes}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Zap className="h-4 w-4" />
              Créer Types d'Opérations
            </Button>

            <Button
              onClick={generateOperations}
              variant="outline"
              className="flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Créer Opérations
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
              className="flex items-center gap-2 md:col-span-2"
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
              <li>• L'ordre recommandé : Agences → Types d'Opérations → Opérations → Commissions</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TestDataGenerator;
