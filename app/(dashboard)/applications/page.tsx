import AddApplicationModal from "@/app/_components/dashboard/AddApplicationModal";
import ApplicationsTable from "@/app/_components/dashboard/ApplicationsTable";
import { Suspense } from "react";

export default async function ApplicationsPage() {
    return (
        <div className="w-full min-w-0 text-[16px] leading-[1.5] [&_button:disabled]:cursor-default [&_button:disabled]:opacity-[1] [&_input:disabled]:cursor-default [&_input:disabled]:opacity-[1] [&_select:disabled]:cursor-default [&_select:disabled]:opacity-[1]">
            <header className="flex items-center justify-between flex-wrap gap-6 mb-8 [&_h1]:text-[34px] [&_h1]:font-semibold [&_h1]:tracking-[-1px] [&_h1]:leading-[1.25] [&_h1]:m-0 [&_p]:mt-3 [&_p]:mb-0 [&_p]:text-[#52637d] [&_p]:text-[16px] [&_p]:leading-[1.6] [&_p]:mx-0">
                <div>
                    <p className="[&&]:mt-0 [&&]:mb-3 [&&]:text-[#52637d] [&&]:text-[14px] leading-[1.6] font-semibold tracking-[1px] mx-0">
                        YOUR NEXT OPPORTUNITY
                    </p>
                    <h1>Applications</h1>
                    <p>Every opportunity, from the first application to the final offer.</p>
                </div>
                {/* Controls are intentionally disabled until application logic is added. */}
                <AddApplicationModal />
            </header>
            {/*We put the section here cuh*/}
            <Suspense>
                <ApplicationsTable />
            </Suspense>
            <p className="mt-5 mb-0 text-[#52637d] text-[14px] leading-[1.6] mx-0">
                One application at a time. One step closer.
            </p>
        </div>
    );
}
