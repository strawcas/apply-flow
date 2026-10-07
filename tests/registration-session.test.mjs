import assert from "node:assert/strict";
import { registerHooks } from "node:module";
import test from "node:test";
import ts from "typescript";

test("registration pages and test emails handle missing sessions before accessing account data", async (t) => {
    const email = "person@example.com";
    const user = {
        id: "current-user",
        identities: [{ provider: "google", identity_data: { full_name: "Google Name" } }],
    };
    let auth = { error: "no session", success: false };
    let profile;
    const calls = [];
    globalThis.__registrationSessionTest = {
        requireGoogleUser: async () => auth,
        session: async () => profile,
        getProfile: async (id) => {
            calls.push(["profile", id]);
            return profile;
        },
        sendMail: async (message) => calls.push(["mail", message.to]),
        redirect: (path) => { throw new Error(`redirect:${path}`); },
    };
    const stubs = {
        "@/app/_lib/session": "export const requireGoogleUser = () => globalThis.__registrationSessionTest.requireGoogleUser(); export const session = () => globalThis.__registrationSessionTest.session();",
        "@/app/_db/profiles": "export const getProfile = (id) => globalThis.__registrationSessionTest.getProfile(id);",
        "@/app/_lib/nodemailer": "export const transporter = { sendMail: (message) => globalThis.__registrationSessionTest.sendMail(message) };",
        "next/navigation": "export const redirect = (path) => globalThis.__registrationSessionTest.redirect(path);",
        "next/link": "export default function Link() {}",
        "@/app/_components/auth/auth-shell": "export function AuthShell() {}",
        "./resend-form": "export function ResendForm() {}",
        "./profile-form": "export function ProfileForm() {}",
    };
    const pages = new Set([
        new URL("../app/confirm-email/page.tsx", import.meta.url).href,
        new URL("../app/signup/complete/page.tsx", import.meta.url).href,
    ]);
    const hooks = registerHooks({
        resolve(specifier, context, next) {
            if (Object.hasOwn(stubs, specifier))
                return { shortCircuit: true, url: `data:text/javascript,${encodeURIComponent(stubs[specifier])}` };
            if (specifier === "@/app/_lib/auth-policy")
                return { shortCircuit: true, url: new URL("../app/_lib/auth-policy.ts", import.meta.url).href };
            return next(specifier, context);
        },
        load(url, context, next) {
            if (!pages.has(url)) return next(url, context);
            const loaded = next(url, { ...context, format: "module" });
            const source = ts.transpileModule(String(loaded.source), {
                compilerOptions: { module: ts.ModuleKind.ESNext, jsx: ts.JsxEmit.ReactJSX },
            }).outputText;
            return { shortCircuit: true, format: "module", source };
        },
    });
    try {
        const { default: ConfirmEmailPage } = await import("../app/confirm-email/page.tsx");
        const { default: CompleteSignupPage } = await import("../app/signup/complete/page.tsx");
        const { sendEmail } = await import("../app/_actions/emails.ts");
        const confirm = () => ConfirmEmailPage({ searchParams: Promise.resolve({}) });

        await t.test("invalid sessions redirect both pages without querying profiles", async () => {
            for (const invalid of [
                { error: "no session", success: false },
                { user, email, success: false },
                { user, success: true },
                { email, success: true },
            ]) {
                auth = invalid;
                for (const page of [confirm, CompleteSignupPage])
                    await assert.rejects(page(), { message: "redirect:/login" });
            }
            assert.deepEqual(calls.splice(0), []);
        });
        await t.test("valid sessions keep the existing registration destinations and form values", async () => {
            auth = { user, email, success: true };
            profile = null;
            await assert.rejects(confirm(), { message: "redirect:/signup/complete" });
            const signup = await CompleteSignupPage();
            assert.equal(signup.props.children.props.email, email);
            assert.equal(signup.props.children.props.fullName, "Google Name");
            profile = { email, email_confirmed_at: null };
            assert.equal((await confirm()).type.name, "AuthShell");
            await assert.rejects(CompleteSignupPage(), { message: "redirect:/confirm-email" });
            profile = { email, email_confirmed_at: new Date() };
            for (const page of [confirm, CompleteSignupPage])
                await assert.rejects(page(), { message: "redirect:/dashboard" });
            assert.equal(calls.length, 6);
            assert.ok(calls.splice(0).every(([operation, id]) => operation === "profile" && id === user.id));
        });
        await t.test("test email requires a profile and only sends to its owner", async () => {
            profile = undefined;
            await assert.rejects(sendEmail(email, "Test", "<p>Test</p>"), /You can only send a test email to your own account/);
            profile = { email };
            await assert.rejects(sendEmail("other@example.com", "Test", "<p>Test</p>"), /You can only send a test email to your own account/);
            assert.deepEqual(calls, []);
            await sendEmail(email, "Test", "<p>Test</p>");
            assert.deepEqual(calls, [["mail", email]]);
        });
    } finally {
        hooks.deregister();
        delete globalThis.__registrationSessionTest;
    }
});
