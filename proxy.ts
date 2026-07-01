import { withAuth } from "next-auth/middleware";

export const proxy = withAuth({
  pages: {
    signIn: "/login",
  },
  secret: process.env.NEXTAUTH_SECRET || "loop-app-super-secret-key-32-chars-minimum-length-value",
});

export const config = {
  matcher: ["/dashboard/:path*"],
};
