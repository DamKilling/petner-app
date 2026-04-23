import Link from "next/link";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export function PageHeader({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-5 border-b border-black/10 pb-8 md:flex-row md:items-end md:justify-between">
      <div className="max-w-3xl">
        {eyebrow ? (
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.24em] text-[#f06f4f]">
            {eyebrow}
          </p>
        ) : null}
        <h1 className="text-4xl font-semibold tracking-tight md:text-6xl">{title}</h1>
        {description ? (
          <p className="mt-4 max-w-2xl text-base leading-7 text-black/60">{description}</p>
        ) : null}
      </div>
      {action}
    </div>
  );
}

export function Panel({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={cn(
        "rounded-[2rem] border border-black/10 bg-white/78 p-6 shadow-[0_24px_80px_rgba(47,35,22,0.08)] backdrop-blur",
        className,
      )}
    >
      {children}
    </section>
  );
}

export function ButtonLink({
  href,
  children,
  variant = "primary",
}: {
  href: string;
  children: ReactNode;
  variant?: "primary" | "secondary";
}) {
  return (
    <Link
      href={href}
      className={cn(
        "inline-flex h-11 items-center justify-center rounded-full px-5 text-sm font-semibold",
        variant === "primary"
          ? "bg-[#201a16] text-white hover:-translate-y-0.5 hover:bg-[#352820]"
          : "border border-black/10 bg-white/70 text-[#201a16] hover:-translate-y-0.5 hover:bg-white",
      )}
    >
      {children}
    </Link>
  );
}

export function SubmitButton({
  children,
  variant = "primary",
}: {
  children: ReactNode;
  variant?: "primary" | "danger";
}) {
  return (
    <button
      className={cn(
        "inline-flex h-11 items-center justify-center rounded-full px-5 text-sm font-semibold",
        variant === "danger"
          ? "bg-red-50 text-red-600 hover:bg-red-100"
          : "bg-[#f06f4f] text-white hover:-translate-y-0.5 hover:bg-[#df5e3e]",
      )}
      type="submit"
    >
      {children}
    </button>
  );
}

export function Field({
  label,
  name,
  placeholder,
  defaultValue,
  type = "text",
  required = false,
}: {
  label: string;
  name: string;
  placeholder?: string;
  defaultValue?: string | number | null;
  type?: string;
  required?: boolean;
}) {
  return (
    <label className="grid gap-2 text-sm font-medium text-black/70">
      {label}
      <input
        className="h-11 rounded-2xl border border-black/10 bg-white px-4 text-base text-black"
        defaultValue={type === "file" ? undefined : (defaultValue ?? "")}
        name={name}
        placeholder={placeholder}
        required={required}
        type={type}
      />
    </label>
  );
}

export function TextArea({
  label,
  name,
  placeholder,
  defaultValue,
  required = false,
}: {
  label: string;
  name: string;
  placeholder?: string;
  defaultValue?: string | null;
  required?: boolean;
}) {
  return (
    <label className="grid gap-2 text-sm font-medium text-black/70">
      {label}
      <textarea
        className="min-h-28 rounded-2xl border border-black/10 bg-white px-4 py-3 text-base text-black"
        defaultValue={defaultValue ?? ""}
        name={name}
        placeholder={placeholder}
        required={required}
      />
    </label>
  );
}

export function SelectField({
  label,
  name,
  children,
  defaultValue,
}: {
  label: string;
  name: string;
  children: ReactNode;
  defaultValue?: string;
}) {
  return (
    <label className="grid gap-2 text-sm font-medium text-black/70">
      {label}
      <select
        className="h-11 rounded-2xl border border-black/10 bg-white px-4 text-base text-black"
        defaultValue={defaultValue}
        name={name}
      >
        {children}
      </select>
    </label>
  );
}

export function EmptyState({ title, detail }: { title: string; detail: string }) {
  return (
    <div className="rounded-[1.5rem] border border-dashed border-black/15 bg-white/45 p-8 text-center">
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-black/55">{detail}</p>
    </div>
  );
}
