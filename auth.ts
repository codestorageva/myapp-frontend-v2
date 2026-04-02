import CredentialsProvider from "next-auth/providers/credentials";
import type { NextAuthConfig } from "next-auth";
import NextAuth from "next-auth";
import { API_ENDPOINTS } from "@/core/constants/api_endpoint";

interface Credentials {
  email: string;
  password: string;
}

const SERVER_URL = process.env.NEXT_PUBLIC_API_URL || "";

async function login(credentials: Credentials) {
  try {
    console.log("SERVER_URL:", SERVER_URL);
    console.log("LOGIN URL:", `${SERVER_URL}${API_ENDPOINTS.login}`);

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);

    const response = await fetch(`${SERVER_URL}${API_ENDPOINTS.login}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: credentials.email,
        password: credentials.password,
      }),
      cache: "no-store",
      signal: controller.signal,
    });

    clearTimeout(timeout);

    console.log("STATUS:", response.status);
    console.log("CONTENT-TYPE:", response.headers.get("content-type"));

    const rawText = await response.text();
    console.log("RAW RESPONSE:", rawText);

    let data = null;
    try {
      data = JSON.parse(rawText);
    } catch (e) {
      console.log("JSON PARSE FAILED");
    }

    console.log("PARSED RESPONSE:", data);
    return data;
  } catch (error: any) {
    console.error("LOGIN API ERROR:", error?.name, error?.message);
    return null;
  }
}

export const authOptions = {
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET || "thisissecret",
  trustHost: true,
  pages: {
    signIn: "/login",
  },
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
  console.log("AUTHORIZE START");

  if (!credentials?.email || !credentials?.password) {
    console.log("AUTHORIZE FAILED: missing credentials");
    return null;
  }

  const user = await login({
    email: credentials.email as string,
    password: credentials.password as string,
  });

  console.log("AUTHORIZE USER:", user);

  if (!user || !user.authToken) {
    console.log("AUTHORIZE FAILED: no authToken");
    return null;
  }

  return {
    id: user.email,
    email: user.email,
    roleName: user.roleName,
    authToken: user.authToken,
    permissionList: user.permissionList || [],
  };

      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.email = (user as any).email;
        token.roleName = (user as any).roleName;
        token.authToken = (user as any).authToken;
        token.permissionList = (user as any).permissionList;
      }
      return token;
    },

    async session({ session, token }) {
      session.user = {
        ...(session.user as any),
        email: token.email,
        roleName: token.roleName,
        authToken: token.authToken,
        permissionList: token.permissionList,
      } as any;

      return session;
    },
  },
} satisfies NextAuthConfig;

export const { handlers, auth, signOut, signIn } = NextAuth(authOptions);
