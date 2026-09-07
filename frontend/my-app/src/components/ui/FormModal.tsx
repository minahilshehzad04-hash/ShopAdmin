"use client";

import { useEffect, type ReactNode } from "react";
import { X } from "lucide-react";

interface FormModalProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
  onClose: () => void;
  maxWidth?: string;
}

export function FormModal({ title, subtitle, children, onClose, maxWidth }: FormModalProps) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  return (
    <div
      className="modal-backdrop"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        className="form-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="form-modal-title"
        style={maxWidth ? { maxWidth } : undefined}
      >
        <div className="form-modal-heading">
          <div>
            <h2 id="form-modal-title">{title}</h2>
            {subtitle && <p className="form-modal-subtitle">{subtitle}</p>}
          </div>
          <button
            className="modal-close"
            type="button"
            aria-label="Close form"
            onClick={onClose}
          >
            <X size={18} />
          </button>
        </div>
        <div className="form-modal-body">
          {children}
        </div>
      </div>
    </div>
  );
}
