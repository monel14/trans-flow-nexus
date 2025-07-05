
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

const BASE_URL = "https://khgbnikgsptoflokvtzu.supabase.co/functions/v1/user-management";

export function useAgents() {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ["agents", user?.agenceId],
    queryFn: async () => {
      if (!user?.agenceId) {
        throw new Error("Agence non trouvée");
      }

      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        throw new Error("Non authentifié");
      }

      const res = await fetch(`${BASE_URL}?resource=users&role=agent&agency_id=${user.agenceId}`, {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Erreur lors du chargement des agents");
      }

      const data = await res.json();
      return data.users || [];
    },
    enabled: !!user?.agenceId,
    refetchInterval: 30000, // Rafraîchit toutes les 30 secondes
    staleTime: 10000, // Considère les données comme fraîches pendant 10 secondes
  });
}

export function useCreateAgent() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (data: {
      name: string;
      email: string;
      password: string;
      phone?: string;
    }) => {
      if (!user?.agenceId) {
        throw new Error("Agence non trouvée");
      }

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
          role_name: "agent",
          agency_id: user.agenceId,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Erreur lors de la création de l'agent");
      }

      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["agents", user?.agenceId] });
    },
  });
}

export function useToggleAgentStatus() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

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
      queryClient.invalidateQueries({ queryKey: ["agents", user?.agenceId] });
    },
  });
}
