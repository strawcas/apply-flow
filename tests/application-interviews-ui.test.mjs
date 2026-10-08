import assert from "node:assert/strict";
import { registerHooks } from "node:module";
import test from "node:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import ts from "typescript";

test("interview fields appear in the application form and the schedule appears in Next step", async () => {
    const hooks = registerHooks({
        resolve(specifier, context, next) {
            if (specifier === "./settings-provider") return next("./settings-provider.tsx", context);
            if (specifier === "@/app/_actions/applicationActions")
                return {
                    shortCircuit: true,
                    url: "data:text/javascript,export async function addApplication() {} export async function updateApplicationAction() {} export async function deleteApplicationAction() {}",
                };
            if (specifier.startsWith("@/app/"))
                return {
                    shortCircuit: true,
                    url: new URL(`../${specifier.slice(2)}${specifier.includes("/_lib/") ? ".ts" : ".tsx"}`, import.meta.url).href,
                };
            return next(specifier, context);
        },
        load(url, context, next) {
            if (!url.endsWith(".tsx")) return next(url, context);
            const loaded = next(url, { ...context, format: "module" });
            return {
                shortCircuit: true,
                format: "module",
                source: ts.transpileModule(String(loaded.source), {
                    compilerOptions: { module: ts.ModuleKind.ESNext, jsx: ts.JsxEmit.ReactJSX },
                }).outputText,
            };
        },
    });
    try {
        const { default: Modal } = await import("../app/_components/Modal.tsx");
        const { default: ApplicationForm } = await import("../app/_components/dashboard/ApplicationForm.tsx");
        const { default: ApplicationsTableRow } = await import("../app/_components/dashboard/ApplicationsTableRow.tsx");
        const application = {
            id: 1,
            companyName: "Example",
            jobTitle: "Engineer",
            status: "Interview",
            location: "Remote",
            workMode: "Remote",
            employmentType: "Full-time",
            interviewDate: "2026-10-15",
            interviewTime: "09:30",
        };
        const renderForm = (initialValue) =>
            renderToStaticMarkup(createElement(Modal, null, createElement(ApplicationForm, {
                type: "edit",
                initialValue,
                submitAction: async () => {},
                deleteAction: async () => ({ success: true, message: "Deleted" }),
            })));
        const scheduled = renderForm(application);
        const input = (html, name) => html.match(/<input\b[^>]*>/g).find((tag) => tag.includes(`name="${name}"`));
        assert.match(input(scheduled, "interviewDate"), /type="date"/);
        assert.match(input(scheduled, "interviewDate"), /value="2026-10-15"/);
        assert.match(input(scheduled, "interviewTime"), /type="time"/);
        assert.match(input(scheduled, "interviewTime"), /value="09:30"/);
        assert.ok(scheduled.indexOf("Interview date") > scheduled.indexOf("Date applied"));
        assert.ok(scheduled.indexOf("Interview date") < scheduled.indexOf("Salary"));
        // Keep an existing schedule editable after the application progresses.
        assert.match(input(renderForm({ ...application, status: "Offer" }), "interviewDate"), /type="date"/);
        const unscheduled = renderForm({ ...application, interviewDate: null, interviewTime: null });
        assert.match(input(unscheduled, "interviewTime"), /disabled=""/);
        const applied = renderForm({ ...application, status: "Applied", interviewDate: null, interviewTime: null });
        assert.match(input(applied, "interviewDate"), /type="hidden"/);
        const row = renderToStaticMarkup(createElement("table", null, createElement("tbody", null,
            createElement(ApplicationsTableRow, { applicationData: application }),
        )));
        assert.match(row, /dateTime="2026-10-15T09:30"/);
        assert.ok(row.includes("2026-10-15 at 9:30 AM"));
    } finally {
        hooks.deregister();
    }
});
