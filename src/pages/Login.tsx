
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import CreateDeveloperAccount from '@/components/CreateDeveloperAccount';
import DemoAccountsGenerator from '@/components/Developer/DemoAccountsGenerator';
import { Shield, User, Users, Code, MapPin, Building, Star } from 'lucide-react';

const Login = () => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { error } = await signIn(identifier, password);
      if (error) {
        let errorMessage = error.message;
        
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

  const handleQuickSignIn = async (email: string, password: string, accountName: string) => {
    console.log('🚀 Connexion rapide avec:', email);
    setIdentifier(email);
    setPassword(password);
    
    setTimeout(async () => {
      setIsLoading(true);
      try {
        const { error } = await signIn(email, password);
        if (error) {
          console.error('Erreur connexion rapide:', error);
          toast({
            title: "Erreur de connexion",
            description: error.message === 'Invalid login credentials' 
              ? `Compte ${accountName} non trouvé. Veuillez générer les comptes d'abord.`  
              : error.message,
            variant: "destructive",
          });
        } else {
          toast({
            title: "Connexion réussie",
            description: `Bienvenue ${accountName} dans TransFlow Nexus!`,
          });
          navigate('/dashboard');
        }
      } catch (error) {
        console.error('Erreur connexion rapide:', error);
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
          description: "Votre compte a été créé avec succès.",
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

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin': return <Shield className="h-4 w-4 text-red-600" />;
      case 'chef': return <Users className="h-4 w-4 text-blue-600" />;
      case 'agent': return <User className="h-4 w-4 text-green-600" />;
      case 'dev': return <Code className="h-4 w-4 text-purple-600" />;
      default: return <User className="h-4 w-4 text-gray-600" />;
    }
  };

  const testAccounts = [
    {
      category: "🎯 Comptes Production",
      description: "Comptes principaux pour démonstrations",
      password: "Varies",
      accounts: [
        { email: "admin@transflow.com", password: "admin123", name: "Admin Principal", role: "admin", location: "Système" },
        { email: "sousadmin@transflow.com", password: "sousadmin123", name: "Sous-Admin", role: "admin", location: "Support" },
        { email: "dev@transflow.com", password: "dev123", name: "Développeur", role: "dev", location: "Tech" }
      ]
    },
    {
      category: "🌟 Comptes TransFlow Nexus Demo",
      description: "Comptes de démonstration avec identifiants uniques",
      password: "admin123/chef123/agent123",
      accounts: [
        { email: "admin_monel@transflownexus.demo", password: "admin123", name: "Admin Monel", role: "admin", location: "Général" },
        { email: "sadmin_pierre@transflownexus.demo", password: "sadmin123", name: "Sous-Admin Pierre", role: "admin", location: "Support" },
        { email: "chef_dakar_diallo@transflownexus.demo", password: "chef123", name: "Chef Dakar Diallo", role: "chef", location: "Dakar" },
        { email: "chef_thies_fall@transflownexus.demo", password: "chef123", name: "Chef Thiès Fall", role: "chef", location: "Thiès" },
        { email: "dkr01_fatou@transflownexus.demo", password: "agent123", name: "Agent Fatou", role: "agent", location: "Dakar" },
        { email: "ths01_amadou@transflownexus.demo", password: "agent123", name: "Agent Amadou", role: "agent", location: "Thiès" }
      ]
    },
    {
      category: "🏢 Comptes Test Standard",
      description: "Comptes de test avec structure hiérarchique",
      password: "TransFlow2024!",
      accounts: [
        { email: "admin@transflownexus.com", password: "TransFlow2024!", name: "Admin Standard", role: "admin", location: "Système" },
        { email: "chef.dakar@transflownexus.com", password: "TransFlow2024!", name: "Chef Dakar", role: "chef", location: "Dakar" },
        { email: "agent1.dakar@transflownexus.com", password: "TransFlow2024!", name: "Agent 1 Dakar", role: "agent", location: "Dakar" }
      ]
    },
    {
      category: "🎮 Comptes Démo Uniforme",
      description: "Tous avec le même mot de passe pour facilité de test",
      password: "Demo123!",
      accounts: [
        { email: "admin.general@transflow.com", password: "Demo123!", name: "Admin Général", role: "admin", location: "Central" },
        { email: "sous.admin@transflow.com", password: "Demo123!", name: "Sous-Administrateur", role: "admin", location: "Support" },
        { email: "developer@transflow.com", password: "Demo123!", name: "Développeur Système", role: "dev", location: "IT" },
        { email: "chef.douala@transflow.com", password: "Demo123!", name: "Chef Douala", role: "chef", location: "Douala" },
        { email: "chef.yaoundé@transflow.com", password: "Demo123!", name: "Chef Yaoundé", role: "chef", location: "Yaoundé" },
        { email: "agent1.douala@transflow.com", password: "Demo123!", name: "Agent 1 Douala", role: "agent", location: "Douala" }
      ]
    },
    {
      category: "📝 Comptes Example/Test",
      description: "Comptes pour tests génériques",
      password: "Password123!",
      accounts: [
        { email: "admin@example.com", password: "Password123!", name: "Admin Example", role: "admin", location: "Test" },
        { email: "chef.centrale@example.com", password: "Password123!", name: "Chef Centrale", role: "chef", location: "Centrale" },
        { email: "agent1.centrale@example.com", password: "Password123!", name: "Agent Centrale", role: "agent", location: "Centrale" },
        { email: "agent1.nord@example.com", password: "Password123!", name: "Agent Nord", role: "agent", location: "Nord" },
        { email: "support@example.com", password: "Password123!", name: "Support Client", role: "admin", location: "Support" }
      ]
    }
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto w-20 h-20 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
            <span className="text-white font-bold text-3xl">TF</span>
          </div>
          <h2 className="text-4xl font-bold text-gray-900 mb-2">
            TransFlow Nexus
          </h2>
          <p className="text-lg text-gray-600">
            Plateforme de Gestion des Opérations Financières
          </p>
        </div>

        <div className="grid lg:grid-cols-4 gap-6">
          {/* Connexion/Inscription */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Connexion</CardTitle>
                <CardDescription>Accédez à votre compte</CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="signin" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="signin">Connexion</TabsTrigger>
                    <TabsTrigger value="signup">Inscription</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="signin">
                    <form className="space-y-4" onSubmit={handleSignIn}>
                      <div>
                        <Label htmlFor="signin-identifier">Email/Identifiant</Label>
                        <Input
                          id="signin-identifier"
                          type="text"
                          value={identifier}
                          onChange={(e) => setIdentifier(e.target.value)}
                          placeholder="admin@transflow.com"
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
                    <form className="space-y-4" onSubmit={handleSignUp}>
                      <div>
                        <Label htmlFor="signup-name">Nom complet</Label>
                        <Input
                          id="signup-name"
                          type="text"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="Votre nom complet"
                          required
                        />
                      </div>

                      <div>
                        <Label htmlFor="signup-identifier">Email</Label>
                        <Input
                          id="signup-identifier"
                          type="email"
                          value={identifier}
                          onChange={(e) => setIdentifier(e.target.value)}
                          placeholder="votre@email.com"
                          required
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
                          minLength={6}
                        />
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
              </CardContent>
            </Card>

            {/* Compte Développeur */}
            <div className="mt-6">
              <CreateDeveloperAccount />
            </div>
          </div>

          {/* Comptes de Test */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="h-5 w-5 text-yellow-500" />
                  Comptes de Test - Connexion Rapide
                </CardTitle>
                <CardDescription>
                  Cliquez sur un bouton pour vous connecter instantanément
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {testAccounts.map((category, categoryIndex) => (
                  <div key={categoryIndex} className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-gray-800">
                        {category.category}
                      </h3>
                      <Badge variant="outline" className="text-xs">
                        {category.password}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">
                      {category.description}
                    </p>
                    
                    <div className="grid grid-cols-1 gap-2">
                      {category.accounts.map((account, index) => (
                        <Button
                          key={index}
                          onClick={() => handleQuickSignIn(account.email, account.password, account.name)}
                          variant="outline"
                          disabled={isLoading}
                          className="flex items-center justify-between p-3 h-auto text-left hover:bg-gray-50"
                        >
                          <div className="flex items-center gap-3">
                            {getRoleIcon(account.role)}
                            <div>
                              <div className="font-medium text-sm">{account.name}</div>
                              <div className="text-xs text-gray-500">{account.email}</div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <MapPin className="h-3 w-3 text-gray-400" />
                            <span className="text-xs text-gray-500">{account.location}</span>
                          </div>
                        </Button>
                      ))}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Générateur de Comptes */}
          <div className="lg:col-span-1">
            <DemoAccountsGenerator />
          </div>
        </div>

        <div className="mt-8 p-6 bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Building className="h-5 w-5 text-blue-600" />
            Guide de Test TransFlow Nexus
          </h3>
          <div className="grid md:grid-cols-3 gap-4 text-sm">
            <div className="p-4 bg-red-50 rounded-lg border border-red-200">
              <div className="flex items-center gap-2 font-medium text-red-800 mb-2">
                <Shield className="h-4 w-4" />
                Administrateurs
              </div>
              <p className="text-red-700">Accès complet au système, gestion des utilisateurs et validation des opérations</p>
            </div>
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center gap-2 font-medium text-blue-800 mb-2">
                <Users className="h-4 w-4" />
                Chefs d'Agence
              </div>
              <p className="text-blue-700">Gestion des agents, validation des opérations et supervision des agences</p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-center gap-2 font-medium text-green-800 mb-2">
                <User className="h-4 w-4" />
                Agents
              </div>
              <p className="text-green-700">Création et traitement des opérations financières quotidiennes</p>
            </div>
          </div>
          
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2">💡 Conseils d'utilisation :</h4>
            <ul className="text-gray-700 space-y-1 text-sm">
              <li>• <strong>Production :</strong> Utilisez les comptes @transflow.com pour les démonstrations officielles</li>
              <li>• <strong>Demo :</strong> Les comptes @transflownexus.demo ont des identifiants uniques</li>
              <li>• <strong>Test :</strong> Les comptes "Demo123!" sont parfaits pour les tests rapides</li>
              <li>• <strong>Développement :</strong> Créez un compte développeur pour accéder aux outils avancés</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
