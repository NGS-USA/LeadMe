import { supabase } from "./supabase";

async function callAdminFunction(action, payload = {}) {
  const { data: { session } } = await supabase.auth.getSession();
  const response = await fetch(
    `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-users`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({ action, ...payload }),
    }
  );
  const data = await response.json();
  if (data.error) throw new Error(data.error);
  return data;
}

export const adminApi = {
  listUsers: () => callAdminFunction("list"),
  inviteUser: (email, role) => callAdminFunction("invite", { email, role }),
  resetPassword: (email) => callAdminFunction("reset_password", { email }),
  resetMfa: (userId) => callAdminFunction("reset_mfa", { userId }),
  updateRole: (userId, role) => callAdminFunction("update_role", { userId, role }),
  deleteUser: (userId) => callAdminFunction("delete_user", { userId }),
};