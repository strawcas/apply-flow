export const applicationStatuses = ["Saved", "Applied", "In review", "Interview", "Offer", "Rejected"] as const;
export type ApplicationStatus = (typeof applicationStatuses)[number];
