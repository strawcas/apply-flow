"use client";

import { useState, type ComponentProps } from "react";
import styles from "./auth.module.css";

type AuthFieldProps = ComponentProps<"input"> & { label: string; id: string };

export function AuthField({ label, id, type = "text", ...props }: AuthFieldProps) {
  const [visible, setVisible] = useState(false);
  const isPassword = type === "password";
  return (
    <div className={styles.field}>
      <label htmlFor={id}>{label}</label>
      <div className={styles.inputWrap}>
        <input {...props} id={id} type={isPassword && visible ? "text" : type}
          className={isPassword ? styles.passwordInput : styles.input} />
        {isPassword && (
          <button className={styles.reveal} type="button" onClick={() => setVisible(!visible)}
            aria-label={visible ? "Hide password" : "Show password"} aria-pressed={visible} aria-controls={id}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
              <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" />
              <circle cx="12" cy="12" r="3" />
              {visible && <path d="m3 3 18 18" />}
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}

export function AuthButton({ children, ...props }: ComponentProps<"button">) {
  return <button type="submit" {...props} className={styles.submit}>{children}<span aria-hidden="true">↗</span></button>;
}
