import assert from "node:assert/strict";
import test from "node:test";
import { registrationDestination, oauthDestination, readOAuthFlow, validateProfile } from "../app/_lib/auth-policy.ts";

test("login cannot implicitly register a new Google identity", () => {
    assert.equal(oauthDestination("login", null, "person@example.com"), "/login?notice=signup-first");
    assert.equal(oauthDestination("signup", null, "person@example.com"), "/signup/complete");
});

test("repeated signup keeps registered accounts on the proper access path", () => {
    assert.equal(oauthDestination("signup", { email: "person@example.com", email_confirmed_at: null }, "person@example.com"), "/confirm-email");
    assert.equal(oauthDestination("signup", { email: "person@example.com", email_confirmed_at: new Date() }, "person@example.com"), "/dashboard");
});

test("OAuth requires a matching browser flow, including for malformed cookies", () => {
    for (const cookie of [undefined, "null", "[]", "{", JSON.stringify({ intent: "signup", nonce: "different" }), JSON.stringify({ intent: "admin", nonce: "expected" })]) {
        assert.equal(readOAuthFlow(cookie, "expected"), null);
    }
    assert.equal(readOAuthFlow(JSON.stringify({ intent: "signup", nonce: "expected" }), "expected"), "signup");
    assert.equal(readOAuthFlow(JSON.stringify({ intent: "login", nonce: "expected" }), "expected"), "login");
});

test("a Google identity alone cannot enter the dashboard", () => {
    assert.equal(registrationDestination(null, "person@example.com"), "/signup/complete");
});

test("a saved registration requires its separate email confirmation", () => {
    assert.equal(registrationDestination({ email: "person@example.com", email_confirmed_at: null }, "person@example.com"), "/confirm-email");
});

test("confirmation of an old email cannot unlock a changed account", () => {
    assert.equal(registrationDestination({ email: "old@example.com", email_confirmed_at: new Date() }, "new@example.com"), "/confirm-email");
});

test("a completed registration can enter the dashboard", () => {
    assert.equal(registrationDestination({ email: "person@example.com", email_confirmed_at: new Date() }, "person@example.com"), "/dashboard");
});

test("birthdate validation rejects calendar rollover, future dates, and malformed inputs", () => {
    for (const date of ["2001-02-29", "2000-02-30", "2000-13-01", "2027-01-01", "1899-12-31", "09/22/2000", "", null]) {
        assert.ok(validateProfile("Kimberly Castro", date, "2026-09-22"), String(date));
    }
    assert.equal(validateProfile("Kimberly Castro", "2000-02-29", "2026-09-22"), null);
});

test("profile validation rejects blank and oversized names", () => {
    for (const name of ["   ", "a".repeat(101), null]) assert.ok(validateProfile(name, "2000-01-01"));
    assert.equal(validateProfile("  Kimberly Castro  ", "2000-01-01"), null);
});
