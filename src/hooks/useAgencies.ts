
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface Agency {
  id: number;
  name: string;
  city: string | null;
  chef_agence_id: string | null;
  created_at: string | null;
  updated_at: string | null;
  chef_agence?: {
    name: string;
    email: string;
  } | null;
}

export const useAgencies = () => {
  const { data: agencies = [], isLoading, error, refetch } = useQuery({
    queryKey: ['agencies'],
    queryFn: async (): Promise<Agency[]> => {
      const { data, error } = await supabase
        .from('agencies')
        .select(`
          *,
          chef_agence:profiles!agencies_chef_agence_id_fkey (
            name,
            email
          )
        `)
        .order('name', { ascending: true });

      if (error) {
        console.error('Error fetching agencies:', error);
        throw error;
      }

      // Transform the data to handle potential null relations
      const transformedData = (data || []).map(agency => ({
        ...agency,
        chef_agence: agency.chef_agence && typeof agency.chef_agence === 'object' && agency.chef_agence !== null && 'name' in agency.chef_agence 
          ? agency.chef_agence 
          : null
      }));

      return transformedData;
    },
  });

  return {
    agencies,
    isLoading,
    error,
    refetch
  };
};

export const useCreateAgency = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (agencyData: {
      name: string;
      city?: string;
      chef_agence_id?: string;
    }) => {
      const { data, error } = await supabase
        .from('agencies')
        .insert({
          name: agencyData.name,
          city: agencyData.city,
          chef_agence_id: agencyData.chef_agence_id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agencies'] });
    },
  });
};

export const useUpdateAgency = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      id, 
      updates 
    }: { 
      id: number; 
      updates: Partial<Agency> 
    }) => {
      const { data, error } = await supabase
        .from('agencies')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agencies'] });
    },
  });
};

export const useDeleteAgency = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      const { error } = await supabase
        .from('agencies')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agencies'] });
    },
  });
};
