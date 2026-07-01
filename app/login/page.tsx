import { LoginForm } from "@/app/ui/login-form";

/**
 * This is the dedicated login page. It will be rendered when the user
 * navigates directly to the /login URL.
 *
 * The Intercepting Route at /@auth/(.)login/page.tsx will capture
 * client-side navigations to /login and show a modal instead.
 */
export default function LoginPage() {
  return <LoginForm />;
}
