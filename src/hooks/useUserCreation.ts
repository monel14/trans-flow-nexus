
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import type { CreateAgentValues, CreateChefAgenceValues, CreateSousAdminValues } from '@/lib/schemas';

// =====================================================
// HOOKS POUR LA CRÉATION D'UTILISATEURS VIA RPC
// =====================================================

// Type pour les réponses des fonctions RPC
interface RPCResponse {
  status: 'success' | 'error';
  message: string;
  user_id?: string;
  identifier?: string;
  code?: string;
}

// Hook pour créer un Agent (utilisé par les Chefs d'Agence)
export const useCreateAgent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (values: CreateAgentValues) => {
      console.log('🔄 Création d\'un agent:', values);

      const { data, error } = await supabase.rpc('create_agent', {
        user_name: values.fullName,
        user_email: values.identifier,
        user_password: values.initialPassword,
        agency_id: parseInt(values.agencyId || '0')
      });

      if (error) {
        console.error('❌ Erreur RPC create_agent:', error);
        throw new Error(error.message);
      }

      const response = data as unknown as RPCResponse;
      console.log('✅ Réponse RPC create_agent:', response);

      if (response.status === 'error') {
        throw new Error(response.message);
      }

      return response;
    },
    onSuccess: (data) => {
      console.log('✅ Agent créé avec succès:', data);
      toast({
        title: "Agent créé avec succès",
        description: `L'agent ${data.identifier} a été créé dans votre agence.`,
      });
      
      // Invalider les caches pertinents
      queryClient.invalidateQueries({ queryKey: ['agents'] });
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
    onError: (error: Error) => {
      console.error('❌ Erreur lors de la création de l\'agent:', error);
      let errorMessage = error.message;
      
      // Messages d'erreur personnalisés
      if (error.message.includes('déjà utilisé')) {
        errorMessage = "Cet identifiant est déjà utilisé. Veuillez en choisir un autre.";
      } else if (error.message.includes('Permission refusée')) {
        errorMessage = "Vous n'avez pas les permissions nécessaires pour créer un agent.";
      } else if (error.message.includes('Format d\'identifiant invalide')) {
        errorMessage = "Format d'identifiant invalide. Utilisez le format: codeagence.prénom";
      }

      toast({
        title: "Erreur lors de la création",
        description: errorMessage,
        variant: "destructive",
      });
    },
  });
};

// Hook pour créer un Chef d'Agence (utilisé par les Admins Généraux)
export const useCreateChefAgence = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (values: CreateChefAgenceValues) => {
      console.log('🔄 Création d\'un chef d\'agence:', values);

      const { data, error } = await supabase.rpc('create_chef_agence', {
        user_name: values.fullName,
        user_email: values.identifier,
        user_password: values.initialPassword,
        agency_id: values.agencyId,
      });

      if (error) {
        console.error('❌ Erreur RPC create_chef_agence:', error);
        throw new Error(error.message);
      }

      const response = data as unknown as RPCResponse;
      console.log('✅ Réponse RPC create_chef_agence:', response);

      if (response.status === 'error') {
        throw new Error(response.message);
      }

      return response;
    },
    onSuccess: (data) => {
      console.log('✅ Chef d\'agence créé avec succès:', data);
      toast({
        title: "Chef d'agence créé avec succès",
        description: `Le chef d'agence ${data.identifier} a été créé.`,
      });
      
      // Invalider les caches pertinents
      queryClient.invalidateQueries({ queryKey: ['chefs-agence'] });
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['agencies'] });
    },
    onError: (error: Error) => {
      console.error('❌ Erreur lors de la création du chef d\'agence:', error);
      let errorMessage = error.message;
      
      // Messages d'erreur personnalisés
      if (error.message.includes('déjà utilisé')) {
        errorMessage = "Cet identifiant est déjà utilisé. Veuillez en choisir un autre.";
      } else if (error.message.includes('Permission refusée')) {
        errorMessage = "Vous n'avez pas les permissions nécessaires pour créer un chef d'agence.";
      } else if (error.message.includes('Format d\'identifiant invalide')) {
        errorMessage = "Format d'identifiant invalide. Utilisez le format: chef.ville.nom";
      } else if (error.message.includes('Agence inexistante')) {
        errorMessage = "L'agence sélectionnée n'existe pas.";
      }

      toast({
        title: "Erreur lors de la création",
        description: errorMessage,
        variant: "destructive",
      });
    },
  });
};

// Hook pour créer un Sous-Admin (utilisé par les Admins Généraux)
export const useCreateSousAdmin = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (values: CreateSousAdminValues) => {
      console.log('🔄 Création d\'un sous-admin:', values);

      const { data, error } = await supabase.rpc('create_sous_admin', {
        user_name: values.fullName,
        user_email: values.identifier,
        user_password: values.initialPassword,
      });

      if (error) {
        console.error('❌ Erreur RPC create_sous_admin:', error);
        throw new Error(error.message);
      }

      const response = data as unknown as RPCResponse;
      console.log('✅ Réponse RPC create_sous_admin:', response);

      if (response.status === 'error') {
        throw new Error(response.message);
      }

      return response;
    },
    onSuccess: (data) => {
      console.log('✅ Sous-admin créé avec succès:', data);
      toast({
        title: "Sous-administrateur créé avec succès",
        description: `Le sous-administrateur ${data.identifier} a été créé.`,
      });
      
      // Invalider les caches pertinents
      queryClient.invalidateQueries({ queryKey: ['sous-admins'] });
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
    onError: (error: Error) => {
      console.error('❌ Erreur lors de la création du sous-admin:', error);
      let errorMessage = error.message;
      
      // Messages d'erreur personnalisés
      if (error.message.includes('déjà utilisé')) {
        errorMessage = "Cet identifiant est déjà utilisé. Veuillez en choisir un autre.";
      } else if (error.message.includes('Permission refusée')) {
        errorMessage = "Vous n'avez pas les permissions nécessaires pour créer un sous-administrateur.";
      } else if (error.message.includes('Format d\'identifiant invalide')) {
        errorMessage = "Format d'identifiant invalide. Utilisez le format: sadmin.prénom";
      }

      toast({
        title: "Erreur lors de la création",
        description: errorMessage,
        variant: "destructive",
      });
    },
  });
};

// Hook pour récupérer la liste des agences (pour les selects)
import { useQuery } from '@tanstack/react-query';

export const useAgencies = () => {
  return useQuery({
    queryKey: ['agencies'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('agencies')
        .select('id, name, city')
        .eq('is_active', true)
        .order('name');

      if (error) {
        console.error('❌ Erreur lors de la récupération des agences:', error);
        throw new Error(error.message);
      }

      return data;
    },
  });
};
