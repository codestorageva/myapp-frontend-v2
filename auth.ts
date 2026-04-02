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

    const response = await fetch(`${SERVER_URL}${API_ENDPOINTS.login}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: credentials.email,
        password: credentials.password,
      }),
      cache: "no-store",
    });

    const data = await response.json();
    console.log("API login response:", data);

    if (!response.ok) {
      return null;
    }

    if (!data?.success) {
      return null;
    }

    return {
      id: data.email, // important
      email: data.email,
      success: data.success,
      successCode: data.successCode,
      roleId: data.roleId,
      roleName: data.roleName,
      fullName: data.fullName,
      userName: data.userName,
      mobNo: data.mobNo,
      authToken: data.authToken,
      permissionList: data.permissionList || [],
    };
  } catch (error: any) {
    console.error("LOGIN API ERROR:", error?.message);
    return null;
  }
}

export const authOptions = {
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
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
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const user = await login({
          email: credentials.email as string,
          password: credentials.password as string,
        });

        if (!user) {
          return null;
        }

        return user;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.success = (user as any).success;
        token.successCode = (user as any).successCode;
        token.roleId = (user as any).roleId;
        token.roleName = (user as any).roleName;
        token.fullName = (user as any).fullName;
        token.userName = (user as any).userName;
        token.mobNo = (user as any).mobNo;
        token.authToken = (user as any).authToken;
        token.permissionList = (user as any).permissionList;
      }
      return token;
    },

    async session({ session, token }) {
      session.user = {
        ...session.user,
        id: token.id as string,
        email: token.email as string,
        success: token.success as boolean,
        successCode: token.successCode as string,
        roleId: token.roleId as number,
        roleName: token.roleName as string,
        fullName: token.fullName as string,
        userName: token.userName as string,
        mobNo: token.mobNo as string,
        authToken: token.authToken as string,
        permissionList: token.permissionList as any[],
      };

      return session;
    },
  },
} satisfies NextAuthConfig;

export const { handlers, auth, signIn, signOut } = NextAuth(authOptions);
