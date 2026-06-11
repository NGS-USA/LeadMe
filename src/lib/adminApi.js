import { account, db, col } from "./appwrite";
import { Client, Functions } from "appwrite";

const APPWRITE_ENDPOINT = import.meta.env.VITE_APPWRITE_ENDPOINT;
const APPWRITE_PROJECT_ID = import.meta.env.VITE_APPWRITE_PROJECT_ID;
const FUNCTION_ID = "admin-users";

async function callAdminFunction(action, payload = {}) {
  const client = new Client()
    .setEndpoint(APPWRITE_ENDPOINT)
    .setProject(APPWRITE_PROJECT_ID);

  const sess = await account.getSession("current");
  client.setSession(sess.$id);

  const functions = new Functions(client);

  const execution = await functions.createExecution(
    FUNCTION_ID,
    JSON.stringify({ action, ...payload }),
    false,
    "/",
    "POST",
    { "Content-Type": "application/json" }
  );

  if (execution.status === "failed") {
    throw new Error(execution.responseBody || "Function execution failed");
  }

  const result = JSON.parse(execution.responseBody || "{}");
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