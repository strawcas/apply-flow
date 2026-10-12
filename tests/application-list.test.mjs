import assert from "node:assert/strict";
import test from "node:test";
import { filterAndSortApplications } from "../app/_lib/application-list.ts";

const applications = [
    {
        id: 1,
        companyName: "Beta",
        jobTitle: "Designer",
        status: "Applied",
        dateApplied: "2026-10-01",
        createdAt: new Date("2026-10-03T09:00:00Z"),
    },
    {
        id: 2,
        companyName: "alpha",
        jobTitle: "Engineer",
        status: "Interview",
        dateApplied: "2026-10-10",
        createdAt: "2026-10-02T09:00:00Z",
    },
    {
        id: 3,
        companyName: "Gamma",
        jobTitle: "Engineer",
        status: "Saved",
        dateApplied: null,
        createdAt: "2026-10-12T09:00:00Z",
    },
    {
        id: 4,
        companyName: "Beta",
        jobTitle: "Engineer",
        status: "Interview",
        dateApplied: "2026-10-01",
        createdAt: "2026-10-04T09:00:00Z",
    },
    {
        id: 5,
        companyName: "Delta",
        jobTitle: "Designer",
        status: "Withdrawn",
        dateApplied: null,
        createdAt: "2026-10-11T09:00:00Z",
    },
];
const select = (options = {}, records = applications) =>
    filterAndSortApplications(records, { query: "", status: "", sort: "newest", ...options });
const ids = (records) => records.map((application) => application.id);

test("search trims whitespace, ignores case, and matches company or role", () => {
    assert.deepEqual(ids(select({ query: "  bEtA  " })), [4, 1]);
    assert.deepEqual(ids(select({ query: "engineer" })), [2, 4, 3]);
    assert.deepEqual(ids(select({ query: "   " })), ids(select()));
});

test("status and search combine, including stored custom statuses", () => {
    assert.deepEqual(ids(select({ status: "Interview" })), [2, 4]);
    assert.deepEqual(ids(select({ status: "Interview", query: "Beta" })), [4]);
    assert.deepEqual(ids(select({ status: "Withdrawn" })), [5]);
    assert.deepEqual(select({ status: "Offer" }), []);
    assert.deepEqual(select({ status: "Applied", query: "Engineer" }), []);
    assert.deepEqual(select({}, []), []);
});

test("date sorting uses application dates and keeps undated records last in both directions", () => {
    assert.deepEqual(ids(select()), [2, 4, 1, 3, 5]);
    assert.deepEqual(ids(select({ sort: "oldest" })), [1, 4, 2, 5, 3]);
});

test("company sorting is case insensitive and uses dates to break ties", () => {
    assert.deepEqual(ids(select({ sort: "company-asc" })), [2, 4, 1, 5, 3]);
    assert.deepEqual(ids(select({ sort: "company-desc" })), [3, 5, 4, 1, 2]);
});

test("date ties have a stable order and sorting never mutates the supplied records", () => {
    const tied = [
        { ...applications[0], id: 9 },
        { ...applications[0], id: 6 },
    ].map(Object.freeze);
    const frozen = Object.freeze(tied);
    assert.deepEqual(ids(select({}, frozen)), [9, 6]);
    assert.deepEqual(ids(select({ sort: "oldest" }, frozen)), [6, 9]);
    assert.deepEqual(ids(frozen), [9, 6]);
    assert.deepEqual(ids(applications), [1, 2, 3, 4, 5]);
});
