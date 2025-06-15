
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

const BASE_URL = "https://khgbnikgsptoflokvtzu.supabase.co/functions/v1/user-management";

export function useChefsAgence() {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ["chefs-agence"],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        throw new Error("Non authentifié");
      }

      const res = await fetch(`${BASE_URL}?resource=users&role=chef_agence`, {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Erreur lors du chargement des chefs d'agence");
      }

      const data = await res.json();
      return data.users || [];
    },
    enabled: user?.role === 'admin_general',
    refetchInterval: 30000,
    staleTime: 10000,
  });
}

export function useCreateChefAgence() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      name: string;
      email: string;
      password: string;
      phone?: string;
      agency_id: number;
    }) => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        throw new Error("Non authentifié");
      }

      const res = await fetch(`${BASE_URL}?resource=users`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: data.name,
          email: data.email,
          password: data.password,
          phone: data.phone,
          role_name: "chef_agence",
          agency_id: data.agency_id,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Erreur lors de la création du chef d'agence");
      }

      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chefs-agence"] });
    },
  });
}

export function useToggleChefAgenceStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, isActive }: { userId: string; isActive: boolean }) => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        throw new Error("Non authentifié");
      }

      const res = await fetch(`${BASE_URL}?resource=toggle-status`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id: userId,
          is_active: isActive,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Erreur lors de la modification du statut");
      }

      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chefs-agence"] });
    },
  });
}
