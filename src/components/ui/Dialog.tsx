"use client";

import type { ReactNode } from "react";
import { motion, useReducedMotion } from "motion/react";
import { X } from "lucide-react";
import { useModal } from "@/hooks/useModal";
import { cn } from "@/lib/utils";

interface DialogProps {
  title: string;
  onClose: () => void;
  children: ReactNode;
  className?: string;
  /** Hide the close (×) button, e.g. for confirmations that have explicit buttons */
  hideClose?: boolean;
}

/** macOS-style modal sheet with focus trap, Escape to close and focus restore. */
export function Dialog({ title, onClose, children, className, hideClose }: DialogProps) {
  const { ref, onKeyDown } = useModal<HTMLDivElement>(onClose);
  const reduce = useReducedMotion();
  return (
    <div className="fixed inset-0 z-[1800] grid place-items-center bg-black/25 p-4" onClick={onClose}>
      <motion.div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        tabIndex={-1}
        onKeyDown={onKeyDown}
        onClick={(e) => e.stopPropagation()}
        initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.94, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.96 }}
        transition={{ type: "spring", stiffness: 420, damping: 34 }}
        className={cn("glass glass-panel relative max-h-full w-full max-w-md overflow-auto rounded-2xl outline-none", className)}
      >
        {!hideClose && (
          <button type="button" onClick={onClose} aria-label="Close dialog" className="absolute top-3 right-3 grid size-7 place-items-center rounded-full text-muted hover:bg-hover hover:text-foreground">
            <X className="size-4" aria-hidden="true" />
          </button>
        )}
        {children}
      </motion.div>
    </div>
  );
}
