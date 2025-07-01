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
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isConfirmingEmail, setIsConfirmingEmail] = useState(false);
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { error } = await signIn(email, password);
      if (error) {
        let errorMessage = error.message;
        
        // Gestion spécifique des erreurs
        if (error.message === 'Invalid login credentials') {
          errorMessage = "Email ou mot de passe incorrect.";
        } else if (error.message === 'Email not confirmed') {
          errorMessage = "Votre email n'est pas encore confirmé. Pour les comptes de démonstration, utilisez le générateur de comptes pour créer et confirmer automatiquement les comptes.";
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

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { error } = await signUp(email, password, { name });
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
                      <Label htmlFor="signin-email">Email</Label>
                      <Input
                        id="signin-email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="votre@email.com"
                        required
                        className="mt-1"
                      />
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
                      <Label htmlFor="signup-email">Email</Label>
                      <Input
                        id="signup-email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="votre@email.com"
                        required
                        className="mt-1"
                      />
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
        </div>
      </div>
    </div>
  );
};

export default Login;
