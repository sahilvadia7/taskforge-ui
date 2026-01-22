import { withAuth } from "next-auth/middleware";

export default withAuth({
    callbacks: {
        authorized({ req, token }) {
            // Add custom logic here if needed, e.g. checking roles
            // For now, if token exists, user is authorized
            return !!token;
        },
    },
});

export const config = {
    // Matcher: protect all routes under /dashboard, /projects, /issues, etc.
    // Exclude /api/auth, /auth/login, /public, etc.
    matcher: ["/dashboard/:path*", "/projects/:path*", "/issues/:path*", "/settings/:path*"],
};
