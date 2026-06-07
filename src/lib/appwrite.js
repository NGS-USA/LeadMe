import { Client, Account, Databases, ID, Query } from "appwrite";

const client = new Client();

client
  .setEndpoint(import.meta.env.VITE_APPWRITE_ENDPOINT)
  .setProject(import.meta.env.VITE_APPWRITE_PROJECT_ID);

export const account = new Account(client);
export const databases = new Databases(client);
export { ID, Query };

export const db = import.meta.env.VITE_APPWRITE_DATABASE_ID;
export const col = {
  leads:    import.meta.env.VITE_APPWRITE_LEADS_ID,
  vendors:  import.meta.env.VITE_APPWRITE_VENDORS_ID,
  reps:     import.meta.env.VITE_APPWRITE_REPS_ID,
  profiles: import.meta.env.VITE_APPWRITE_PROFILES_ID,
  settings: import.meta.env.VITE_APPWRITE_SETTINGS_ID,
};