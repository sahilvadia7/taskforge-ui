import NextAuth from "next-auth";

declare module "next-auth" {
    interface Session {
        accessToken?: string;
        id_token?: string;
        error?: string;
        user: {
            id: string;
            email: string;
            name: string;
            image?: string;
        };
    }
}