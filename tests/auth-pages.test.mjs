import assert from "node:assert/strict";
import { registerHooks } from "node:module";
import test from "node:test";
import ts from "typescript";

test("login and signup route signed-in users to their account destination before rendering forms", async (t) => {
    const email = "person@example.com";
    const googleUser = { id: "current-user", email, identities: [{ provider: "google" }] };
    let user = null;
    let authError = null;
    let profile = null;
    let profileReads = 0;
    globalThis.__authPagesTest = {
        getUser: async () => ({ data: { user }, error: authError }),
        getProfile: async (id) => {
            assert.equal(id, "current-user");
            profileReads++;
            return profile;
        },
        redirect: (path) => {
            throw new Error(`redirect:${path}`);
        },
    };
    const stubs = {
        "server-only": "",
        "next/navigation": "export const redirect = (...args) => globalThis.__authPagesTest.redirect(...args);",
        "@/app/_db/profiles": "export const getProfile = (...args) => globalThis.__authPagesTest.getProfile(...args);",
        "@/app/_components/auth/auth-shell": "export function AuthShell() {}",
        "@/app/login/login-form": "export function LoginForm() {}",
        "@/app/signup/signup-form": "export function SignupForm() {}",
    };
    const sessionUrl = new URL("../app/_lib/session.ts", import.meta.url).href;
    const hooks = registerHooks({
        resolve(specifier, context, next) {
            if (Object.hasOwn(stubs, specifier))
                return { shortCircuit: true, url: `data:text/javascript,${encodeURIComponent(stubs[specifier])}` };
            if (specifier === "@/app/_lib/session") return { shortCircuit: true, url: sessionUrl };
            if (context.parentURL === sessionUrl && specifier === "./supabase")
                return {
                    shortCircuit: true,
                    url: `data:text/javascript,${encodeURIComponent("export async function createClient() { return { auth: { getUser: () => globalThis.__authPagesTest.getUser() } }; }")}`,
                };
            if (context.parentURL === sessionUrl && specifier === "./auth-policy")
                return { shortCircuit: true, url: new URL("../app/_lib/auth-policy.ts", import.meta.url).href };
            return next(specifier, context);
        },
        load(url, context, next) {
            if (!url.endsWith("/app/login/page.tsx") && !url.endsWith("/app/signup/page.tsx"))
                return next(url, context);
            const loaded = next(url, { ...context, format: "module" });
            const source = ts.transpileModule(String(loaded.source), {
                compilerOptions: { module: ts.ModuleKind.ESNext, jsx: ts.JsxEmit.ReactJSX },
            }).outputText;
            return { shortCircuit: true, format: "module", source };
        },
    });
    try {
        const { default: LoginPage } = await import("../app/login/page.tsx");
        const { default: SignupPage } = await import("../app/signup/page.tsx");
        const login = () => LoginPage({ searchParams: Promise.resolve({ notice: "confirmed" }) });
        await t.test("visitors and expired sessions can still use both forms and login notices", async () => {
            for (const scenario of [null, "expired session"]) {
                authError = scenario;
                const loginForm = await login();
                assert.equal(loginForm.props.children.type.name, "LoginForm");
                assert.equal(loginForm.props.children.props.notice, "confirmed");
                assert.equal((await SignupPage()).props.children.type.name, "SignupForm");
            }
            assert.equal(profileReads, 0);
        });
        await t.test("completed accounts go directly to dashboard from either page", async () => {
            user = googleUser;
            authError = null;
            profile = { user_id: user.id, email, email_confirmed_at: new Date() };
            await assert.rejects(login(), /redirect:\/dashboard/);
            await assert.rejects(SignupPage(), /redirect:\/dashboard/);
        });
        await t.test(
            "incomplete registration follows the existing completion and email-confirmation flow",
            async () => {
                for (const [details, destination] of [
                    [null, "/signup/complete"],
                    [{ email, email_confirmed_at: null }, "/confirm-email"],
                    [{ email: "old@example.com", email_confirmed_at: new Date() }, "/confirm-email"],
                ]) {
                    profile = details;
                    for (const page of [login, SignupPage])
                        await assert.rejects(page(), (error) => error.message === `redirect:${destination}`);
                }
            },
        );
        await t.test("an invalid Google session cannot be treated as a signed-in account", async () => {
            user = { ...googleUser, identities: [{ provider: "email" }] };
            assert.equal((await login()).props.children.type.name, "LoginForm");
            assert.equal((await SignupPage()).props.children.type.name, "SignupForm");
        });
    } finally {
        hooks.deregister();
        delete globalThis.__authPagesTest;
    }
});
