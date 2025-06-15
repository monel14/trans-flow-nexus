
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

const BASE_URL = "https://khgbnikgsptoflokvtzu.supabase.co/functions/v1/user-management";
const getAuthHeader = () => {
  // Token stocké côté frontend (voir AuthContext ou localStorage si mock)
  const user = localStorage.getItem("user");
  if (!user) return {};
  // L'edge function attend "Bearer something", ici une dummy key pour l'instant (à sécuriser - voir note)
  return { Authorization: "Bearer DUMMY_ADMIN_TOKEN" };
};

// Récupérer la liste des chefs d'agence
export function useChefsAgence() {
  return useQuery({
    queryKey: ["chefsAgence"],
    queryFn: async () => {
      const res = await fetch(`${BASE_URL}?resource=users&role=chef_agence`, {
        headers: {
          ...getAuthHeader(),
        },
      });
      if (!res.ok) throw new Error("Erreur chargement chefs d'agence.");
      return await res.json();
    },
  });
}

// Créer un chef d'agence
export function useCreateChefAgence() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      name: string;
      email: string;
      password: string;
      agency_id: number|null;
    }) => {
      const res = await fetch(`${BASE_URL}?resource=users`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeader(),
        },
        body: JSON.stringify({
          name: data.name,
          email: data.email,
          password: data.password,
          role_name: "chef_agence",
          agency_id: data.agency_id ?? null,
        }),
      });
      const resData = await res.json();
      if (!res.ok) throw new Error(resData?.error || "Erreur création utilisateur.");
      return resData;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chefsAgence"] });
    },
  });
}

// Activer / suspendre chef d'agence
export function useToggleChefAgence() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      user_id,
      is_active,
    }: {
      user_id: string;
      is_active: boolean;
    }) => {
      const res = await fetch(`${BASE_URL}?resource=users`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeader(),
        },
        body: JSON.stringify({ user_id, is_active }),
      });
      const resData = await res.json();
      if (!res.ok) throw new Error(resData?.error || "Erreur statut.");
      return resData;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chefsAgence"] });
    },
  });
}
