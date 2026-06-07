import { account } from "./appwrite";

const APPWRITE_ENDPOINT = import.meta.env.VITE_APPWRITE_ENDPOINT;
const APPWRITE_PROJECT_ID = import.meta.env.VITE_APPWRITE_PROJECT_ID;
const FUNCTION_ID = "admin-users";

async function callAdminFunction(action, payload = {}) {
  const sess = await account.getSession("current");
  const response = await fetch(
    `${APPWRITE_ENDPOINT}/functions/${FUNCTION_ID}/executions`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Appwrite-Project": APPWRITE_PROJECT_ID,
        "Authorization": `Bearer ${sess.providerAccessToken || sess.$id}`,
      },
      body: JSON.stringify({ action, ...payload }),
    }
  );
  const data = await response.json();
  if (data.error) throw new Error(data.error);
  const result = JSON.parse(data.responseBody || "{}");
  if (result.error) throw new Error(result.error);
  return result;
}

export const adminApi = {
  listUsers:     ()                    => callAdminFunction("list"),
  inviteUser:    (email, role)         => callAdminFunction("invite", { email, role }),
  resetPassword: (email)               => callAdminFunction("reset_password", { email }),
  resetMfa:      (userId)              => callAdminFunction("reset_mfa", { userId }),
  updateRole:    (userId, role)        => callAdminFunction("update_role", { userId, role }),
  deleteUser:    (userId)              => callAdminFunction("delete_user", { userId }),
};