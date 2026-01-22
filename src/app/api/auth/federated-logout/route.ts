import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
    const keycloakIssuer = process.env.KEYCLOAK_ISSUER;

    if (!keycloakIssuer) {
        console.error("KEYCLOAK_ISSUER not defined");
        return NextResponse.redirect(new URL("/auth/login?error=ConfigurationError", request.url));
    }

    // Construct Keycloak Logout URL
    // Standard Pattern: <issuer>/protocol/openid-connect/logout
    // Verify if issuer handles the /auth path (older keycloak) or not
    const logoutUrl = `${keycloakIssuer}/protocol/openid-connect/logout`;

    // Redirect back to login page after logout
    const postLogoutRedirectUri = `${request.nextUrl.origin}/`;

    const finalUrl = `${logoutUrl}?post_logout_redirect_uri=${encodeURIComponent(postLogoutRedirectUri)}`;

    return NextResponse.redirect(finalUrl);
}
