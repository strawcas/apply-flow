import { LoadingSpinner } from "@/app/_components/loading-spinner";

export default function Loading() {
    return (
        <div
            data-ui="loading"
            className="-m-2 flex min-h-svh items-center justify-center bg-[#f7f9fc] p-6 text-[#2563eb] [font-family:var(--font-geist-sans),_Arial,_sans-serif]"
        >
            <LoadingSpinner size="l" showLabel />
        </div>
    );
}
