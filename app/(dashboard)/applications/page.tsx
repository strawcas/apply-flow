import AddApplication from "@/app/_components/dashboard/AddApplication";
import ApplicationsTable from "@/app/_components/dashboard/ApplicationsTable";
import { Suspense } from "react";
import { LoadingSpinner } from "@/app/_components/loading-spinner";

export default async function ApplicationsPage() {
    return (
        <div className="w-full min-w-0 text-[16px] leading-[1.5] [&_button:disabled]:cursor-default [&_button:disabled]:opacity-[1] [&_input:disabled]:cursor-default [&_input:disabled]:opacity-[1] [&_select:disabled]:cursor-default [&_select:disabled]:opacity-[1]">
            <header className="flex items-center justify-between flex-wrap gap-6 mb-8">
                <h1 className="m-0 text-[34px] font-semibold tracking-[-1px] leading-[1.25]">Applications</h1>
                <AddApplication />
            </header>
            <Suspense fallback={<LoadingSpinner />}>
                <ApplicationsTable />
            </Suspense>
        </div>
    );
}
