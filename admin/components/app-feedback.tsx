"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from "react";
import { AlertTriangle, Trash2 } from "lucide-react";
import {
  Toaster,
  createToastManager,
} from "@/components/ui/toast";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * GLOBAL FEEDBACK SYSTEM
 * -----------------------
 * Every mutating action in the admin must give the user two things:
 *   1. Permission — destructive/important actions ask for confirmation first.
 *   2. Feedback — every successful task raises a toast.
 *
 * Usage:
 *   const confirm = useConfirm();
 *   const toast  = useToast();
 *
 *   if (await confirm({ title, description, tone: "destructive" })) {
 *     doTheThing();
 *     toast.success("Done", "Order #123 was cancelled.");
 *   }
 *
 * The provider is mounted once in <AdminShell>, so these hooks are available
 * on every page.
 */

// A single shared toast manager drives the <Toaster> portal below.
const manager = createToastManager();

const DURATION = 3800;

function pushToast(
  type: "success" | "error" | "info" | "warning",
  title: string,
  description?: string
) {
  manager.add({
    type,
    title,
    description,
    timeout: type === "error" ? 5200 : DURATION,
  });
}

interface ToastApi {
  success: (title: string, description?: string) => void;
  error: (title: string, description?: string) => void;
  info: (title: string, description?: string) => void;
  warning: (title: string, description?: string) => void;
}

const toastApi: ToastApi = {
  success: (t, d) => pushToast("success", t, d),
  error: (t, d) => pushToast("error", t, d),
  info: (t, d) => pushToast("info", t, d),
  warning: (t, d) => pushToast("warning", t, d),
};

/** Non-hook accessor for callers outside a component (rare). */
export const toast = toastApi;

export function useToast(): ToastApi {
  return toastApi;
}

export interface ConfirmOptions {
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  /** "destructive" renders a red confirm button (delete/cancel/archive). */
  tone?: "default" | "destructive";
}

type ConfirmFn = (options: ConfirmOptions) => Promise<boolean>;

const ConfirmContext = createContext<ConfirmFn | null>(null);

export function useConfirm(): ConfirmFn {
  const ctx = useContext(ConfirmContext);
  if (!ctx) {
    throw new Error("useConfirm must be used within <AppFeedbackProvider>");
  }
  return ctx;
}

interface Pending {
  options: ConfirmOptions;
  resolve: (value: boolean) => void;
}

export function AppFeedbackProvider({ children }: { children: ReactNode }) {
  const [pending, setPending] = useState<Pending | null>(null);

  const confirm = useCallback<ConfirmFn>((options) => {
    return new Promise<boolean>((resolve) => {
      setPending({ options, resolve });
    });
  }, []);

  const settle = (value: boolean) => {
    pending?.resolve(value);
    setPending(null);
  };

  const destructive = pending?.options.tone === "destructive";

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}

      {/* Global toast portal */}
      <Toaster toastManager={manager} />

      {/* Global confirmation dialog */}
      <AlertDialog open={Boolean(pending)} onOpenChange={(open) => !open && settle(false)}>
        <AlertDialogContent className="sm:max-w-lg">
          <AlertDialogHeader>
            <div className="flex items-start gap-3">
              <div
                className={cn(
                  "flex h-10 w-10 shrink-0 items-center justify-center rounded-full",
                  destructive
                    ? "bg-destructive/10 text-destructive"
                    : "bg-primary/10 text-primary"
                )}
              >
                {destructive ? (
                  <Trash2 className="h-5 w-5" />
                ) : (
                  <AlertTriangle className="h-5 w-5" />
                )}
              </div>
              <div className="space-y-1 text-left">
                <AlertDialogTitle>{pending?.options.title}</AlertDialogTitle>
                {pending?.options.description && (
                  <AlertDialogDescription>{pending.options.description}</AlertDialogDescription>
                )}
              </div>
            </div>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <Button variant="outline" onClick={() => settle(false)} className="cursor-pointer">
              {pending?.options.cancelLabel ?? "Cancel"}
            </Button>
            <Button
              variant={destructive ? "destructive" : "default"}
              onClick={() => settle(true)}
              className="cursor-pointer active:scale-[0.98] transition-all"
            >
              {pending?.options.confirmLabel ?? "Confirm"}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </ConfirmContext.Provider>
  );
}
