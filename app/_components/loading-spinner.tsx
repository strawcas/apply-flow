type LoadingSpinnerProps = {
    label?: string;
    size?: "sm" | "md" | "lg";
    showLabel?: boolean;
    className?: string;
};

const sizes = {
    sm: "size-4",
    md: "size-6",
    lg: "size-10",
};

export function LoadingSpinner({
    label = "Loading…",
    size = "md",
    showLabel = false,
    className = "",
}: LoadingSpinnerProps) {
    return (
        <span role="status" className={`inline-flex items-center justify-center gap-3 ${className}`}>
            <svg
                className={`${sizes[size]} shrink-0 animate-spin motion-reduce:animate-none`}
                viewBox="0 0 24 24"
                fill="none"
                aria-hidden="true"
            >
                <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="3" opacity="0.2" />
                <path d="M12 3a9 9 0 0 1 9 9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
            </svg>
            <span className={showLabel ? "text-sm font-medium" : "sr-only"}>{label}</span>
        </span>
    );
}
