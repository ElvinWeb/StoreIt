"use server";
import { appwriteConfig } from "../appwrite/config";
import { createAdminClient } from "../appwrite";
import { Query, ID } from "node-appwrite";
import { parseStringify } from "../utils";
import { avatarPlaceholderUrl } from "@/constants";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { createSessionClient } from "../appwrite";

const handleError = (error: unknown, message: string) => {
  console.log(`Error: ${message}`, error);
  throw new Error(message);
};

const getUserByEmail = async (email: string) => {
  try {
    const { databases } = await createAdminClient();

    const result = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.usersCollectionId,
      [Query.equal("email", [email])]
    );

    return result.total > 0 ? result.documents[0] : null;
  } catch (error) {
    handleError(error, "Failed to get user by email");
    return null;
  }
};

export const sendEmailOTP = async ({
  email,
}: {
  email: string;
}): Promise<string | undefined> => {
  try {
    const { account } = await createAdminClient();
    const session = await account.createEmailToken(ID.unique(), email);
    return session.userId;
  } catch (error) {
    handleError(error, "Failed to send email OTP");
  }
};

export const createAccount = async ({
  fullName,
  email,
}: {
  fullName: string;
  email: string;
}) => {
  try {
    // Check for existing user first
    const existingUser = await getUserByEmail(email);

    // Send OTP and get accountId
    const accountId = await sendEmailOTP({ email });
    if (!accountId) {
      throw new Error("Failed to send an OTP");
    }

    // Only create new user document if user doesn't exist
    if (!existingUser) {
      const { databases } = await createAdminClient();

      try {
        await databases.createDocument(
          appwriteConfig.databaseId,
          appwriteConfig.usersCollectionId,
          ID.unique(),
          {
            fullName,
            email,
            avatar: avatarPlaceholderUrl,
            accountId,
          }
        );
      } catch (error) {
        handleError(error, "Failed to create user document");
      }
    }

    return parseStringify({ accountId });
  } catch (error) {
    handleError(error, "Account creation failed");
    return null;
  }
};

export const signOutUser = async () => {
  try {
    const { account } = await createSessionClient();
    await account.deleteSession("current");
    const cookieStore = await cookies();
    cookieStore.delete("appwrite-session");
    redirect("/sign-in");
  } catch (error) {
    handleError(error, "Failed to sign out user");
  }
};

export const signInUser = async ({ email }: { email: string }) => {
  try {
    const existingUser = await getUserByEmail(email);
    if (!existingUser) {
      return parseStringify({ accountId: null, error: "User not found" });
    }

    const accountId = await sendEmailOTP({ email });
    if (!accountId) {
      throw new Error("Failed to send OTP");
    }

    return parseStringify({ accountId: existingUser.accountId });
  } catch (error) {
    handleError(error, "Failed to sign in user");
    return null;
  }
};
