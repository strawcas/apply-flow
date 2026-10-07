"use client";

import Modal from "@/app/_components/Modal";
import ApplicationForm from "@/app/_components/dashboard/ApplicationForm";
import { deleteApplicationAction, updateApplicationAction } from "@/app/_actions/applicationActions";
import type { applications } from "@/drizzle/schema";

export default function EditApplication({ applicationData }: { applicationData: typeof applications.$inferSelect }) {
    return (
        <Modal.Window name="edit-application" aria-label="Edit application">
            <ApplicationForm
                type="edit"
                initialValue={applicationData}
                submitAction={updateApplicationAction.bind(null, applicationData.id)}
                deleteAction={deleteApplicationAction.bind(null, applicationData.id)}
            />
        </Modal.Window>
    );
}
