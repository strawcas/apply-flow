"use client";

import {
    cloneElement,
    createContext,
    useCallback,
    useContext,
    useEffect,
    useRef,
    useState,
    type MouseEvent,
    type ReactElement,
    type ReactNode,
} from "react";

type ModalContextValue = {
    openName: string | null;
    open: (name: string) => void;
    close: () => void;
};

const ModalContext = createContext<ModalContextValue | null>(null);

export function useModal() {
    const context = useContext(ModalContext);

    if (!context) {
        throw new Error("Modal components must be used inside <Modal>.");
    }

    return context;
}

function Modal({ children }: { children: ReactNode }) {
    const [openName, setOpenName] = useState<string | null>(null);
    const close = useCallback(() => setOpenName(null), []);

    return <ModalContext value={{ openName, open: setOpenName, close }}>{children}</ModalContext>;
}

type TriggerProps = {
    onClick?: (event: MouseEvent<HTMLElement>) => void;
    "aria-haspopup"?: "dialog";
    "aria-expanded"?: boolean;
};

// Custom trigger components must forward these props to their interactive element.
function Open({ children, opens }: { children: ReactElement<TriggerProps>; opens: string }) {
    const { openName, open } = useModal();

    return cloneElement(children, {
        "aria-haspopup": "dialog",
        "aria-expanded": openName === opens,
        onClick(event) {
            children.props.onClick?.(event);
            if (!event.defaultPrevented) open(opens);
        },
    });
}

function Close({ children }: { children: ReactElement<TriggerProps> }) {
    const { close } = useModal();

    return cloneElement(children, {
        onClick(event) {
            children.props.onClick?.(event);
            if (!event.defaultPrevented) close();
        },
    });
}

type WindowProps = {
    children: ReactNode;
    name: string;
    "aria-label"?: string;
    "aria-labelledby"?: string;
};

function Window({ children, name, ...labelProps }: WindowProps) {
    const { openName, close } = useModal();
    const dialogRef = useRef<HTMLDialogElement>(null);
    const isOpen = openName === name;

    useEffect(() => {
        if (!isOpen) return;

        const dialog = dialogRef.current;
        if (!dialog) return;

        const previousFocus = document.activeElement;
        const previousOverflow = document.body.style.overflow;
        dialog.showModal();
        document.body.style.overflow = "hidden";

        return () => {
            dialog.close();
            document.body.style.overflow = previousOverflow;
            if (previousFocus instanceof HTMLElement) previousFocus.focus();
        };
    }, [isOpen]);

    if (!isOpen) return null;

    // Keep the dialog inside its styling scope. showModal() already places it
    // above the page without losing inherited fonts or scoped browser resets.
    return (
        <dialog
            ref={dialogRef}
            aria-label={labelProps["aria-label"] ?? name}
            aria-labelledby={labelProps["aria-labelledby"]}
            onCancel={(event) => {
                event.preventDefault();
                close();
            }}
            onClick={(event) => {
                if (event.target === event.currentTarget) close();
            }}
            className="fixed inset-0 m-0 flex h-dvh max-h-none w-screen max-w-none items-center justify-center border-0 bg-transparent p-4 outline-none backdrop:bg-black/50 backdrop:backdrop-blur-sm"
        >
            <div className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-[var(--border,var(--color-zinc-200))] bg-[var(--surface,#fff)] text-[var(--text-primary,var(--color-zinc-900))] shadow-2xl">
                {children}
            </div>
        </dialog>
    );
}

Modal.Open = Open;
Modal.Window = Window;
Modal.Close = Close;

export default Modal;
