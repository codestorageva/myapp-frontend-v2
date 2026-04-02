// import CredentialsProvider from "next-auth/providers/credentials";
// import type { NextAuthConfig } from "next-auth";
// import NextAuth from "next-auth";
// import { API_ENDPOINTS } from "@/core/constants/api_endpoint";

// interface Credentials {
//   email: string;
//   password: string;
// }

// const SERVER_URL = process.env.NEXT_PUBLIC_API_URL || "";

// async function login(credentials: Credentials) {
//   try {
//     console.log("SERVER_URL:", SERVER_URL);
//     console.log("LOGIN URL:", `${SERVER_URL}${API_ENDPOINTS.login}`);

//     const response = await fetch(`${SERVER_URL}${API_ENDPOINTS.login}`, {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({
//         email: credentials.email,
//         password: credentials.password,
//       }),
//       cache: "no-store",
//     });

//     const data = await response.json();
//     console.log("API login response:", data);

//     if (!response.ok) {
//       return null;
//     }

//     if (!data?.success) {
//       return null;
//     }

//     return {
//       id: data.email, // important
//       email: data.email,
//       success: data.success,
//       successCode: data.successCode,
//       roleId: data.roleId,
//       roleName: data.roleName,
//       fullName: data.fullName,
//       userName: data.userName,
//       mobNo: data.mobNo,
//       authToken: data.authToken,
//       permissionList: data.permissionList || [],
//     };
//   } catch (error: any) {
//     console.error("LOGIN API ERROR:", error?.message);
//     return null;
//   }
// }

// export const authOptions = {
//   session: {
//     strategy: "jwt",
//   },
//   secret: process.env.NEXTAUTH_SECRET,
//   trustHost: true,
//   pages: {
//     signIn: "/login",
//   },
//   providers: [
//     CredentialsProvider({
//       name: "credentials",
//       credentials: {
//         email: { label: "Email", type: "email" },
//         password: { label: "Password", type: "password" },
//       },
//       async authorize(credentials) {
//         if (!credentials?.email || !credentials?.password) {
//           return null;
//         }

//         const user = await login({
//           email: credentials.email as string,
//           password: credentials.password as string,
//         });

//         if (!user) {
//           return null;
//         }

//         return user;
//       },
//     }),
//   ],
//   callbacks: {
//     async jwt({ token, user }) {
//       if (user) {
//         token.id = user.id;
//         token.email = user.email;
//         token.success = (user as any).success;
//         token.successCode = (user as any).successCode;
//         token.roleId = (user as any).roleId;
//         token.roleName = (user as any).roleName;
//         token.fullName = (user as any).fullName;
//         token.userName = (user as any).userName;
//         token.mobNo = (user as any).mobNo;
//         token.authToken = (user as any).authToken;
//         token.permissionList = (user as any).permissionList;
//       }
//       return token;
//     },

//     async session({ session, token }) {
//       session.user = {
//         ...session.user,
//         id: token.id as string,
//         email: token.email as string,
//         success: token.success as boolean,
//         successCode: token.successCode as string,
//         roleId: token.roleId as number,
//         roleName: token.roleName as string,
//         fullName: token.fullName as string,
//         userName: token.userName as string,
//         mobNo: token.mobNo as string,
//         authToken: token.authToken as string,
//         permissionList: token.permissionList as any[],
//       };

//       return session;
//     },
//   },
// } satisfies NextAuthConfig;

// export const { handlers, auth, signIn, signOut } = NextAuth(authOptions);
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
    console.log("LOGIN CREDENTIAL EMAIL:", credentials.email);

    const response = await fetch(`${SERVER_URL}${API_ENDPOINTS.login}`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    email: credentials.email,
    password: credentials.password,
  }),
});

console.log("STATUS:", response.status);
console.log("HEADERS:", response.headers.get("content-type"));

const text = await response.text();
console.log("RAW RESPONSE:", text);

const data = JSON.parse(text || "{}");
console.log("PARSED RESPONSE:", data);

return data;

    console.log("LOGIN RESPONSE STATUS:", response.status);

    const data = await response.json();
    console.log("BACKEND RESPONSE:", data);

    return data;
  } catch (error: any) {
    console.error("LOGIN API ERROR:", error?.message);
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
  console.log("AUTHORIZE START:", credentials);

  if (!credentials?.email || !credentials?.password) {
    console.log("AUTHORIZE FAILED: missing credentials");
    return null;
  }

  const user = await login({
    email: credentials.email as string,
    password: credentials.password as string,
  });

  console.log("AUTHORIZE USER:", user);

  if (!user) {
    console.log("AUTHORIZE FAILED: user is null");
    return null;
  }

  if (!user.authToken) {
    console.log("AUTHORIZE FAILED: authToken missing");
    return null;
  }

  return {
    id: user.email,
    email: user.email,
    success: user.success,
    successCode: user.successCode,
    roleId: user.roleId,
    roleName: user.roleName,
    fullName: user.fullName,
    userName: user.userName,
    mobNo: user.mobNo,
    authToken: user.authToken,
    permissionList: user.permissionList || [],
  };
}
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = (user as any).id;
        token.email = (user as any).email;
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
        ...(session.user as any),
        id: token.id,
        email: token.email,
        success: token.success,
        successCode: token.successCode,
        roleId: token.roleId,
        roleName: token.roleName,
        fullName: token.fullName,
        userName: token.userName,
        mobNo: token.mobNo,
        authToken: token.authToken,
        permissionList: token.permissionList,
      } as any;

      return session;
    },
  },
} satisfies NextAuthConfig;

export const { handlers, auth, signOut, signIn } = NextAuth(authOptions);
