"use client";

import { SfIconCheck, SfIconInfo, SfIconClose } from "@storefront-ui/react";
import { useStore } from "@/lib/store";
import { classNames } from "@/lib/format";

export function ToastViewport() {
  const { toasts, dismissToast } = useStore();
  if (toasts.length === 0) return null;
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-20 z-50 flex flex-col items-center gap-2 px-4 sm:bottom-6 sm:right-6 sm:left-auto sm:items-end">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={classNames(
            "pointer-events-auto flex w-full max-w-sm items-center gap-2.5 rounded-md border bg-white px-3.5 py-2.5 shadow-md",
            "animate-[fadeIn_0.2s_ease-out]",
            t.tone === "success" ? "border-positive-200" : "border-neutral-200",
          )}
        >
          <span
            className={classNames(
              "flex h-6 w-6 shrink-0 items-center justify-center rounded-full [&>svg]:h-3.5 [&>svg]:w-3.5",
              t.tone === "success" ? "bg-positive-100 text-positive-700" : "bg-neutral-100 text-neutral-600",
            )}
          >
            {t.tone === "success" ? <SfIconCheck /> : <SfIconInfo />}
          </span>
          <p className="flex-1 text-sm font-medium text-neutral-900">{t.message}</p>
          <button type="button" aria-label="Dismiss" onClick={() => dismissToast(t.id)} className="text-neutral-400 hover:text-neutral-700">
            <SfIconClose size="sm" />
          </button>
        </div>
      ))}
    </div>
  );
}
