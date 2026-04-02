import NextAuth from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      success: boolean;
      successCode: string;
      roleId: number;
      roleName: string;
      fullName: string;
      userName: string;
      mobNo: string;
      authToken: string;
      permissionList: any[];
    };
  }

  interface User {
    id: string;
    email: string;
    authToken: string;
    roleName: string;
    permissionList: any[];
  }
}
