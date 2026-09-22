import { GoogleForm } from "@/app/_components/auth/google-form";

export function LoginForm({ notice }: { notice?: string }) {
    return <GoogleForm intent="login" notice={notice} />;
}
