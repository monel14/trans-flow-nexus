
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { User, Shield, UserCheck, Users, Code, Copy } from 'lucide-react';

interface DemoAccount {
  email: string;
  password: string;
  name: string;
  role: string;
  description: string;
  agencyId?: number;
}

const DemoAccountsGenerator = () => {
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedAccounts, setGeneratedAccounts] = useState<DemoAccount[]>([]);

  const demoAccounts: DemoAccount[] = [
    {
      email: 'admin@transflow.com',
      password: 'admin123',
      name: 'Administrateur Général',
      role: 'admin_general',
      description: 'Accès complet au système, gestion des utilisateurs et configuration'
    },
    {
      email: 'sousadmin@transflow.com',
      password: 'sousadmin123',
      name: 'Sous Administrateur',
      role: 'sous_admin',
      description: 'Gestion des opérations et support utilisateur'
    },
    {
      email: 'chef@transflow.com',
      password: 'chef123',
      name: 'Chef Agence Dakar',
      role: 'chef_agence',
      description: 'Gestion de l\'agence et des agents',
      agencyId: 1
    },
    {
      email: 'agent@transflow.com',
      password: 'agent123',
      name: 'Agent Commercial',
      role: 'agent',
      description: 'Création et traitement des opérations',
      agencyId: 1
    },
    {
      email: 'dev@transflow.com',
      password: 'dev123',
      name: 'Développeur Système',
      role: 'developer',
      description: 'Configuration système et types d\'opérations'
    }
  ];

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin_general': return <Shield className="h-4 w-4 text-red-600" />;
      case 'sous_admin': return <UserCheck className="h-4 w-4 text-orange-600" />;
      case 'chef_agence': return <Users className="h-4 w-4 text-blue-600" />;
      case 'agent': return <User className="h-4 w-4 text-green-600" />;
      case 'developer': return <Code className="h-4 w-4 text-purple-600" />;
      default: return <User className="h-4 w-4 text-gray-600" />;
    }
  };

  const createDemoAccount = async (account: DemoAccount) => {
    try {
      // 1. Créer le compte utilisateur avec confirmation automatique
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email: account.email,
        password: account.password,
        options: {
          emailRedirectTo: undefined, // Désactiver la redirection email
          data: {
            name: account.name,
            email_confirm: true // Tenter la confirmation automatique
          }
        }
      });

      if (signUpError) {
        if (signUpError.message.includes('already registered')) {
          console.log(`Compte ${account.email} existe déjà`);
          return true; // Compte existe déjà, c'est OK
        }
        throw signUpError;
      }

      if (authData.user) {
        // 2. Confirmer automatiquement l'email pour les comptes de test
        try {
          const { data: confirmData, error: confirmError } = await supabase.functions.invoke('confirm-email', {
            body: { email: account.email }
          });
          
          if (confirmError) {
            console.warn('Impossible de confirmer automatiquement l\'email:', confirmError);
          } else {
            console.log('Email confirmé automatiquement pour:', account.email);
          }
        } catch (confirmErr) {
          console.warn('Fonction de confirmation d\'email non disponible:', confirmErr);
        }

        // 3. Attendre un moment pour que le trigger crée le profil
        await new Promise(resolve => setTimeout(resolve, 1000));

        // 4. Récupérer l'ID du rôle
        const { data: roleData, error: roleError } = await supabase
          .from('roles')
          .select('id')
          .eq('name', account.role)
          .single();

        if (roleError) {
          console.error('Erreur lors de la récupération du rôle:', roleError);
          return false;
        }

        // 5. Mettre à jour le profil avec le rôle et l'agence
        const { error: profileError } = await supabase
          .from('profiles')
          .update({
            role_id: roleData.id,
            agency_id: account.agencyId || null,
            balance: account.role === 'agent' ? 50000 : 100000, // Solde initial pour les tests
            is_active: true
          })
          .eq('id', authData.user.id);

        if (profileError) {
          console.error('Erreur lors de la mise à jour du profil:', profileError);
          return false;
        }

        // 6. Créer une entrée dans le ledger pour le solde initial
        const initialBalance = account.role === 'agent' ? 50000 : 100000;
        const { error: ledgerError } = await supabase
          .from('transaction_ledger')
          .insert({
            user_id: authData.user.id,
            transaction_type: 'initial_credit',
            amount: initialBalance,
            balance_before: 0,
            balance_after: initialBalance,
            description: 'Solde initial pour compte de démonstration'
          });

        if (ledgerError) {
          console.error('Erreur lors de la création de l\'entrée ledger:', ledgerError);
        }
      }

      return true;
    } catch (error: any) {
      console.error(`Erreur lors de la création du compte ${account.email}:`, error);
      return false;
    }
  };

  const generateAllAccounts = async () => {
    setIsGenerating(true);
    const results: DemoAccount[] = [];
    
    try {
      for (const account of demoAccounts) {
        const success = await createDemoAccount(account);
        if (success) {
          results.push(account);
        }
        // Petite pause entre chaque création
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      setGeneratedAccounts(results);
      
      toast({
        title: "Comptes de démonstration créés",
        description: `${results.length} comptes ont été créés avec succès`,
      });
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: "Erreur lors de la génération des comptes de démonstration",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copié !",
      description: "Les informations ont été copiées dans le presse-papier",
    });
  };

  const copyAllCredentials = () => {
    const credentials = demoAccounts.map(account => 
      `${account.role.toUpperCase()}:\nEmail: ${account.email}\nMot de passe: ${account.password}\n`
    ).join('\n');
    
    copyToClipboard(credentials);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Générateur de Comptes de Démonstration
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex gap-4">
              <Button
                onClick={generateAllAccounts}
                disabled={isGenerating}
                className="flex items-center gap-2"
              >
                <Users className="h-4 w-4" />
                {isGenerating ? 'Génération...' : 'Générer Tous les Comptes'}
              </Button>
              
              <Button
                onClick={copyAllCredentials}
                variant="outline"
                className="flex items-center gap-2"
              >
                <Copy className="h-4 w-4" />
                Copier Tous les Identifiants
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {demoAccounts.map((account, index) => (
                <Card key={index} className="border-l-4 border-l-blue-500">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-sm">
                      {getRoleIcon(account.role)}
                      {account.name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 pt-0">
                    <div className="text-xs text-gray-600">
                      {account.description}
                    </div>
                    
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium">Email:</span>
                        <Button
                          onClick={() => copyToClipboard(account.email)}
                          variant="ghost"
                          size="sm"
                          className="h-6 px-2 text-xs"
                        >
                          <Copy className="h-3 w-3 mr-1" />
                          {account.email}
                        </Button>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium">Mot de passe:</span>
                        <Button
                          onClick={() => copyToClipboard(account.password)}
                          variant="ghost"
                          size="sm"
                          className="h-6 px-2 text-xs"
                        >
                          <Copy className="h-3 w-3 mr-1" />
                          {account.password}
                        </Button>
                      </div>
                      
                      <div className="text-xs">
                        <span className="font-medium">Rôle:</span> {account.role}
                      </div>
                      
                      {account.agencyId && (
                        <div className="text-xs">
                          <span className="font-medium">Agence:</span> {account.agencyId}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">Instructions d'utilisation :</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Cliquez sur "Générer Tous les Comptes" pour créer tous les comptes de démonstration</li>
              <li>• Utilisez les boutons "Copier" pour copier rapidement les identifiants</li>
              <li>• Chaque compte a un solde initial pour tester les opérations</li>
              <li>• Les comptes sont liés aux agences appropriées</li>
              <li>• Vous pouvez maintenant tester toutes les fonctionnalités du système</li>
            </ul>
          </div>

          {generatedAccounts.length > 0 && (
            <div className="mt-6 p-4 bg-green-50 rounded-lg">
              <h4 className="font-medium text-green-900 mb-2">
                ✅ Comptes générés avec succès ({generatedAccounts.length}/5)
              </h4>
              <p className="text-sm text-green-800">
                Vous pouvez maintenant vous connecter avec n'importe lequel de ces comptes pour tester le système.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DemoAccountsGenerator;
