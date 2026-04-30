"use client";

import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export function ConfirmSubmitButton({
  children,
  message,
  className,
}: {
  children: ReactNode;
  message: string;
  className?: string;
}) {
  return (
    <button
      className={cn(
        "inline-flex h-11 items-center justify-center rounded-full bg-red-50 px-5 text-sm font-semibold text-red-600 hover:bg-red-100",
        className,
      )}
      onClick={(event) => {
        if (!window.confirm(message)) {
          event.preventDefault();
        }
      }}
      type="submit"
    >
      {children}
    </button>
  );
}
