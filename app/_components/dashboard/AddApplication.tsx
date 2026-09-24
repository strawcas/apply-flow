"use client";

import Modal from "@/app/_components/Modal";
import ApplicationForm from "@/app/_components/dashboard/ApplicationForm";
import Icon from "@/app/_components/dashboard/dashboard-icon";

export default function AddApplication() {
    return (
        <Modal>
            <Modal.Open opens="application-form">
                <button
                    type="button"
                    className="[font:inherit] flex cursor-pointer items-center gap-3 rounded-lg border-0 bg-[#2f66f5] px-5 py-3 text-sm font-semibold text-white shadow-sm outline-none transition hover:bg-[#2859dc]"
                >
                    <Icon name="plus" />
                    Add application
                </button>
            </Modal.Open>
            <Modal.Window name="application-form" aria-label="Add application">
                <ApplicationForm type="add" />
            </Modal.Window>
        </Modal>
    );
}
