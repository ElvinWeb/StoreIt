"use server";

import { Client, Account, Databases, Avatars, Storage } from "node-appwrite";
import { appwriteConfig } from "./config";
import { cookies } from "next/headers";

export const createSessionClient = async () => {
  const client = new Client()
    .setEndpoint(appwriteConfig.endpointUrl)
    .setProject(appwriteConfig.projectId);

  const cookieStore = await cookies();
  const session = cookieStore.get("appwrite-session");

  if (!session?.value || !session) throw new Error("No session");

  client.setSession(session.value);

  const services = {
    account: new Account(client),
    databases: new Databases(client),
  };

  return {
    get account() {
      return services.account;
    },
    get databases() {
      return services.databases;
    },
  };
};

export const createAdminClient = async () => {
  const client = new Client()
    .setEndpoint(appwriteConfig.endpointUrl)
    .setProject(appwriteConfig.projectId)
    .setKey(appwriteConfig.secretKey);

  const services = {
    account: new Account(client),
    databases: new Databases(client),
    storage: new Storage(client),
    avatars: new Avatars(client),
  };

  return {
    get account() {
      return services.account;
    },
    get databases() {
      return services.databases;
    },
    get storage() {
      return services.storage;
    },
    get avatars() {
      return services.avatars;
    },
  };
};
