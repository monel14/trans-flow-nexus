
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

const BASE_URL =
  "https://khgbnikgsptoflokvtzu.supabase.co/functions/v1/user-management";

const getAuthHeader = () => {
  const user = localStorage.getItem("user");
  if (!user) return {};
  return { Authorization: "Bearer DUMMY_CHEF_TOKEN" };
};

export function useAgents() {
  return useQuery({
    queryKey: ["agents"],
    queryFn: async () => {
      const res = await fetch(`${BASE_URL}?resource=users&role=agent`, {
        headers: {
          ...getAuthHeader(),
        },
      });
      if (!res.ok) throw new Error("Erreur chargement agents.");
      return await res.json();
    },
  });
}

export function useCreateAgent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      name: string;
      email: string;
      password: string;
      phone?: string;
      agency_id?: number;
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
          role_name: "agent",
          agency_id: data.agency_id,
        }),
      });
      const resData = await res.json();
      if (!res.ok)
        throw new Error(resData?.error || "Erreur création agent.");
      return resData;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["agents"] });
    },
  });
}

export function useToggleAgent() {
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
      if (!res.ok)
        throw new Error(resData?.error || "Erreur changement statut agent.");
      return resData;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["agents"] });
    },
  });
}
