
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const CreateDeveloperAccount = () => {
  const [email, setEmail] = useState('dev@transflow.com');
  const [password, setPassword] = useState('developer123');
  const [isCreating, setIsCreating] = useState(false);
  const { toast } = useToast();

  const createDeveloperAccount = async () => {
    setIsCreating(true);
    
    try {
      // 1. Créer le compte utilisateur
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: 'Développeur Système',
          }
        }
      });

      if (signUpError) {
        throw signUpError;
      }

      if (authData.user) {
        // 2. Attendre un moment pour que le trigger crée le profil
        await new Promise(resolve => setTimeout(resolve, 1000));

        // 3. Assigner le rôle développeur
        const { error: roleError } = await supabase
          .from('user_roles')
          .insert({
            user_id: authData.user.id,
            role_id: 5, // ID du rôle developer
            is_active: true
          });

        if (roleError) {
          console.error('Error assigning developer role:', roleError);
          // Ne pas faire échouer tout le processus pour ça
        }

        toast({
          title: "Compte développeur créé",
          description: `Compte créé avec succès : ${email}`,
        });
      }
    } catch (error: any) {
      console.error('Error creating developer account:', error);
      toast({
        title: "Erreur",
        description: error.message || "Erreur lors de la création du compte",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Créer un Compte Développeur</CardTitle>
        <CardDescription>
          Créez rapidement un compte avec les permissions développeur pour tester l'application
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="dev-email">Email</Label>
          <Input
            id="dev-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1"
          />
        </div>
        
        <div>
          <Label htmlFor="dev-password">Mot de passe</Label>
          <Input
            id="dev-password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1"
          />
        </div>

        <Button
          onClick={createDeveloperAccount}
          disabled={isCreating}
          className="w-full"
        >
          {isCreating ? 'Création...' : 'Créer le Compte Développeur'}
        </Button>
      </CardContent>
    </Card>
  );
};

export default CreateDeveloperAccount;
