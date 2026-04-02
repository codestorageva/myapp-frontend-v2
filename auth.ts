import CredentialsProvider from "next-auth/providers/credentials";
  import  type {NextAuthConfig}  from "next-auth";
import NextAuth from "next-auth";
import { SERVER_URL } from "@/core/constants";
import { API_ENDPOINTS } from "@/core/constants/api_endpoint";

interface Credentials {
  email: string;
  password: string;
}

async function login(credentials: Credentials) {
  try {
    const response = await fetch(`${SERVER_URL}${API_ENDPOINTS.login}`, {  // append /auth/login directly
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: credentials.email,
        password: credentials.password,
      }),
    });

    const data = await response.json();
    console.log("API login response:", data);

    if (data.success) return data;
    throw new Error(data.message || "Login failed");
  } catch (error: any) {
    throw new Error(error.message);
  }
}

export const authOptions  = {
  session: {
    strategy: "jwt",
  },
  secret: "thisissecret", 
  trustHost: true,
  pages: {
    signIn: "/login",
  },
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {},
      async authorize(credentials) {
        try {
          const user = await login(credentials as Credentials);          
          return user;
        } catch (error) {
          throw new Error("Failed to login");
        }
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token = { ...token, ...user };
      }
      return token;
    },
    session({ session, token }) {
      session.user = {
        ...session.user,
        success: token.success as boolean,
        successCode: token.successCode as string,
        email:token.email as string,
        roleId: token.roleId as number,
        roleName: token.roleName as string,
        fullName: token.fullName as string,
        userName: token.userName as string,
        mobNo: token.mobNo as string,
        authToken: token.authToken as string
      };

      return session;
    },
  },
} satisfies NextAuthConfig ;


const { handlers, auth,signOut } = NextAuth(authOptions);

export { handlers, auth, signOut };
