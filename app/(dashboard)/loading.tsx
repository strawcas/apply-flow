import { LoadingSpinner } from "@/app/_components/loading-spinner";

export default function DashboardLoading() {
    return (
        <div
            data-ui="dashboard-loading"
            className="flex min-h-[60svh] w-full items-center justify-center text-[var(--blue-text,#2563eb)]"
        >
            <LoadingSpinner size="l" showLabel />
        </div>
    );
}
