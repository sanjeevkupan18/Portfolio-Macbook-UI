import type { AnchorHTMLAttributes, ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
export type ButtonSize = "sm" | "md" | "lg";

export function buttonClass(variant: ButtonVariant = "secondary", size: ButtonSize = "md", className?: string): string {
  const base =
    "inline-flex items-center justify-center gap-1.5 rounded-lg font-medium whitespace-nowrap select-none transition-[background-color,box-shadow,transform,opacity] duration-150 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none";
  const sizes = { sm: "h-7 px-2.5 text-[12px]", md: "h-8 px-3.5 text-[13px]", lg: "h-10 px-5 text-sm" };
  const variants = {
    primary: "bg-accent text-accent-fg shadow-[inset_0_0.5px_0_rgba(255,255,255,0.35),0_1px_2px_rgba(0,0,0,0.25)] hover:brightness-110",
    secondary: "bg-surface text-foreground shadow-[0_0_0_0.5px_var(--border),0_1px_2px_rgba(0,0,0,0.08)] hover:bg-surface-2",
    ghost: "text-foreground hover:bg-hover",
    danger: "bg-danger text-white hover:brightness-110 shadow-[inset_0_0.5px_0_rgba(255,255,255,0.3)]",
  };
  return cn(base, sizes[size], variants[variant], className);
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

export function Button({ variant, size, className, type = "button", ...props }: ButtonProps) {
  return <button type={type} className={buttonClass(variant, size, className)} {...props} />;
}

interface ButtonLinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

/** Anchor styled as a button (downloads, external links). */
export function ButtonLink({ variant, size, className, ...props }: ButtonLinkProps) {
  return <a className={buttonClass(variant, size, className)} {...props} />;
}
