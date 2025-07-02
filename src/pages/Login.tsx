import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import CreateDeveloperAccount from '@/components/CreateDeveloperAccount';
import DemoAccountsGenerator from '@/components/Developer/DemoAccountsGenerator';

const Login = () => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isConfirmingEmail, setIsConfirmingEmail] = useState(false);
  const { signIn, signUp, user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Fonction pour obtenir la route spécifique selon le rôle
  const getDashboardRoute = (userRole: string) => {
    const roleRoutes = {
      'agent': '/dashboard/agent',
      'chef_agence': '/dashboard/chef-agence',
      'admin_general': '/dashboard/admin',
      'sous_admin': '/dashboard/sous-admin',
      'developer': '/dashboard/developer'
    };
    return roleRoutes[userRole] || '/dashboard';
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { error } = await signIn(identifier, password);
      if (error) {
        let errorMessage = error.message;
        
        // Gestion spécifique des erreurs
        if (error.message === 'Invalid login credentials') {
          errorMessage = "Identifiant ou mot de passe incorrect.";
        } else if (error.message === 'Email not confirmed') {
          errorMessage = "Votre compte n'est pas encore confirmé. Contactez votre administrateur.";
        }
        
        toast({
          title: "Erreur de connexion",
          description: errorMessage,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Connexion réussie",
          description: "Bienvenue dans TransFlow Nexus!",
        });
        // Redirection vers le dashboard spécifique sera gérée par useEffect dans AuthContext
        navigate('/dashboard');
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la connexion.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickSignIn = async (demoIdentifier: string, demoPassword: string) => {
    setIdentifier(demoIdentifier);
    setPassword(demoPassword);
    
    // Attendre un moment pour que les champs soient mis à jour visuellement
    setTimeout(async () => {
      setIsLoading(true);
      try {
        const { error } = await signIn(demoIdentifier, demoPassword);
        if (error) {
          if (error.message === 'Email not confirmed') {
            toast({
              title: "Compte non confirmé",
              description: "Contactez votre administrateur pour activer votre compte.",
              variant: "destructive",
            });
          } else {
            toast({
              title: "Erreur de connexion",
              description: error.message,
              variant: "destructive",
            });
          }
        } else {
          toast({
            title: "Connexion réussie",
            description: "Bienvenue dans TransFlow Nexus!",
          });
          // Redirection vers le dashboard spécifique sera gérée par useEffect dans AuthContext
          navigate('/dashboard');
        }
      } catch (error) {
        toast({
          title: "Erreur",
          description: "Une erreur est survenue lors de la connexion.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    }, 100);
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { error } = await signUp(identifier, password, { name });
      if (error) {
        toast({
          title: "Erreur d'inscription",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Inscription réussie",
          description: "Vérifiez votre email pour confirmer votre compte.",
        });
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de l'inscription.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto w-16 h-16 bg-blue-600 rounded-xl flex items-center justify-center mb-4">
            <span className="text-white font-bold text-2xl">TF</span>
          </div>
          <h2 className="text-3xl font-bold text-gray-900">
            TransFlow Nexus
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Plateforme de Gestion des Opérations
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Connexion/Inscription */}
          <div>
            <Tabs defaultValue="signin" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="signin">Connexion</TabsTrigger>
                <TabsTrigger value="signup">Inscription</TabsTrigger>
              </TabsList>
              
              <TabsContent value="signin">
                <form className="mt-8 space-y-6" onSubmit={handleSignIn}>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="signin-identifier">Identifiant</Label>
                      <Input
                        id="signin-identifier"
                        type="text"
                        value={identifier}
                        onChange={(e) => setIdentifier(e.target.value)}
                        placeholder="admin.monel ou chef.dakar.diallo"
                        required
                        className="mt-1"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Format: admin.prénom, chef.ville.nom, ou codeagence.prénom
                      </p>
                    </div>
                    
                    <div>
                      <Label htmlFor="signin-password">Mot de passe</Label>
                      <Input
                        id="signin-password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        required
                        className="mt-1"
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Connexion...' : 'Se connecter'}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="signup">
                <form className="mt-8 space-y-6" onSubmit={handleSignUp}>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="signup-name">Nom complet</Label>
                      <Input
                        id="signup-name"
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Votre nom complet"
                        required
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label htmlFor="signup-identifier">Identifiant</Label>
                      <Input
                        id="signup-identifier"
                        type="text"
                        value={identifier}
                        onChange={(e) => setIdentifier(e.target.value)}
                        placeholder="ex: admin.jean, chef.paris.martin"
                        required
                        className="mt-1"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Utilisez le format approprié selon votre rôle
                      </p>
                    </div>
                    
                    <div>
                      <Label htmlFor="signup-password">Mot de passe</Label>
                      <Input
                        id="signup-password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        required
                        className="mt-1"
                        minLength={6}
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Inscription...' : 'S\'inscrire'}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </div>

          {/* Compte Développeur */}
          <div className="flex items-start justify-center">
            <CreateDeveloperAccount />
          </div>

          {/* Comptes de Démonstration */}
          <div className="flex items-start justify-center">
            <DemoAccountsGenerator />
          </div>
        </div>

        <div className="mt-6 p-4 bg-blue-50 rounded-lg text-center">
          <h3 className="text-sm font-medium text-blue-900 mb-2">Instructions pour les tests :</h3>
          <div className="text-xs text-blue-700 space-y-1">
            <p><strong>Option 1 :</strong> Générez des comptes de démonstration pour tester tous les rôles</p>
            <p><strong>Option 2 :</strong> Créez un compte développeur pour accéder aux outils de développement</p>
            <p><strong>Option 3 :</strong> Inscrivez-vous normalement et demandez à un administrateur d'assigner votre rôle</p>
          </div>
          
          <div className="mt-4">
            <h4 className="text-sm font-medium text-blue-900 mb-2">🚀 Connexion rapide (comptes de test) :</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              <Button
                onClick={() => handleQuickSignIn('admin@transflow.com', 'admin123')}
                variant="outline"
                size="sm"
                className="text-xs"
                disabled={isLoading}
              >
                Admin
              </Button>
              <Button
                onClick={() => handleQuickSignIn('chef@transflow.com', 'chef123')}
                variant="outline"
                size="sm"
                className="text-xs"
                disabled={isLoading}
              >
                Chef Agence
              </Button>
              <Button
                onClick={() => handleQuickSignIn('agent@transflow.com', 'agent123')}
                variant="outline"
                size="sm"
                className="text-xs"
                disabled={isLoading}
              >
                Agent
              </Button>
              <Button
                onClick={() => handleQuickSignIn('sousadmin@transflow.com', 'sousadmin123')}
                variant="outline"
                size="sm"
                className="text-xs"
                disabled={isLoading}
              >
                Sous-Admin
              </Button>
              <Button
                onClick={() => handleQuickSignIn('dev@transflow.com', 'dev123')}
                variant="outline"
                size="sm"
                className="text-xs"
                disabled={isLoading}
              >
                Développeur
              </Button>
            </div>
            <p className="text-xs text-blue-600 mt-2">
              ⚠️ Si connexion échoue (email non confirmé), utilisez d'abord le générateur de comptes
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;