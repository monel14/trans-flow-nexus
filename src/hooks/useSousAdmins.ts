
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

const BASE_URL =
  "https://khgbnikgsptoflokvtzu.supabase.co/functions/v1/user-management";

const getAuthHeader = () => {
  const user = localStorage.getItem("user");
  if (!user) return {};
  return { Authorization: "Bearer DUMMY_ADMIN_TOKEN" };
};

export function useSousAdmins() {
  return useQuery({
    queryKey: ["sousAdmins"],
    queryFn: async () => {
      const res = await fetch(`${BASE_URL}?resource=users&role=sous_admin`, {
        headers: {
          ...getAuthHeader(),
        },
      });
      if (!res.ok) throw new Error("Erreur chargement sous-admins.");
      return await res.json();
    },
  });
}

export function useCreateSousAdmin() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      name: string;
      email: string;
      password: string;
      permissions?: string[];
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
          role_name: "sous_admin",
        }),
      });
      const resData = await res.json();
      if (!res.ok)
        throw new Error(resData?.error || "Erreur création sous-admin.");
      return resData;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sousAdmins"] });
    },
  });
}

export function useToggleSousAdmin() {
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
        throw new Error(resData?.error || "Erreur changement statut sous-admin.");
      return resData;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sousAdmins"] });
    },
  });
}
