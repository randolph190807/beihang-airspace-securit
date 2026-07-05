import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

type ToastVariant = "default" | "warning" | "error";

interface ToastAction {
  label: string;
  onClick: () => void;
}

interface ToastOptions {
  id?: string;
  description?: string;
  duration?: number;
  action?: ToastAction;
}

interface ToastRecord extends Required<Pick<ToastOptions, "id" | "duration">> {
  title: string;
  description?: string;
  action?: ToastAction;
  variant: ToastVariant;
}

interface ToasterProps {
  position?: "top-right" | "top-left" | "bottom-right" | "bottom-left";
  closeButton?: boolean;
  richColors?: boolean;
  toastOptions?: {
    classNames?: {
      toast?: string;
      title?: string;
      description?: string;
      actionButton?: string;
      cancelButton?: string;
    };
  };
}

const DEFAULT_DURATION = 12000;
const listeners = new Set<(toasts: ToastRecord[]) => void>();
let toastQueue: ToastRecord[] = [];

function emit(next: ToastRecord[]) {
  toastQueue = next;
  listeners.forEach((listener) => listener(toastQueue));
}

function upsertToast(title: string, variant: ToastVariant, options: ToastOptions = {}) {
  const id = options.id ?? `toast-${Math.random().toString(36).slice(2)}`;
  const nextToast: ToastRecord = {
    id,
    title,
    description: options.description,
    duration: options.duration ?? DEFAULT_DURATION,
    action: options.action,
    variant,
  };

  const existingIndex = toastQueue.findIndex((item) => item.id === id);
  if (existingIndex >= 0) {
    const next = [...toastQueue];
    next[existingIndex] = nextToast;
    emit(next);
    return id;
  }

  emit([nextToast, ...toastQueue]);
  return id;
}

function dismissToast(id?: string) {
  if (!id) {
    emit([]);
    return;
  }
  emit(toastQueue.filter((item) => item.id !== id));
}

export const toast = Object.assign(
  (title: string, options?: ToastOptions) => upsertToast(title, "default", options),
  {
    warning: (title: string, options?: ToastOptions) => upsertToast(title, "warning", options),
    error: (title: string, options?: ToastOptions) => upsertToast(title, "error", options),
    dismiss: dismissToast,
  },
);

export function Toaster({
  position = "top-right",
  closeButton = false,
  toastOptions,
}: ToasterProps) {
  const [items, setItems] = useState<ToastRecord[]>(toastQueue);

  useEffect(() => {
    listeners.add(setItems);
    return () => {
      listeners.delete(setItems);
    };
  }, []);

  useEffect(() => {
    const timers = items.map((item) =>
      window.setTimeout(() => {
        dismissToast(item.id);
      }, item.duration),
    );

    return () => {
      timers.forEach((timer) => window.clearTimeout(timer));
    };
  }, [items]);

  const positionClassName = useMemo(() => {
    switch (position) {
      case "top-left":
        return "left-4 top-4 items-start";
      case "bottom-left":
        return "bottom-4 left-4 items-start";
      case "bottom-right":
        return "bottom-4 right-4 items-end";
      case "top-right":
      default:
        return "right-4 top-4 items-end";
    }
  }, [position]);

  if (typeof document === "undefined") return null;

  return createPortal(
    <div className={cn("pointer-events-none fixed z-[120] flex max-w-[380px] flex-col gap-3", positionClassName)}>
      {items.map((item) => {
        const variantClassName =
          item.variant === "error"
            ? "border-red-400/35 bg-[#2b1014] text-red-50"
            : item.variant === "warning"
              ? "border-amber-400/35 bg-[#2b2111] text-amber-50"
              : "border-cyan-200/10 bg-[#07182e] text-cyan-50";

        return (
          <div
            key={item.id}
            className={cn(
              "pointer-events-auto w-full rounded-lg border px-4 py-3 shadow-2xl backdrop-blur",
              variantClassName,
              toastOptions?.classNames?.toast,
            )}
          >
            <div className="flex items-start gap-3">
              <div className="min-w-0 flex-1">
                <div className={cn("text-sm font-semibold", toastOptions?.classNames?.title)}>
                  {item.title}
                </div>
                {item.description ? (
                  <div className={cn("mt-1 text-xs leading-5", toastOptions?.classNames?.description)}>
                    {item.description}
                  </div>
                ) : null}
                {item.action ? (
                  <button
                    type="button"
                    className={cn(
                      "mt-3 inline-flex items-center rounded-md px-3 py-1.5 text-xs font-medium transition-opacity hover:opacity-90",
                      item.variant === "error" ? "bg-red-500 text-white" : "bg-amber-500 text-slate-950",
                      toastOptions?.classNames?.actionButton,
                    )}
                    onClick={() => {
                      item.action?.onClick();
                      dismissToast(item.id);
                    }}
                  >
                    {item.action.label}
                  </button>
                ) : null}
              </div>
              {closeButton ? (
                <button
                  type="button"
                  aria-label="关闭提示"
                  className={cn(
                    "rounded-md p-1 text-current/60 transition-colors hover:bg-white/5 hover:text-current",
                    toastOptions?.classNames?.cancelButton,
                  )}
                  onClick={() => dismissToast(item.id)}
                >
                  <X className="h-4 w-4" />
                </button>
              ) : null}
            </div>
          </div>
        );
      })}
    </div>,
    document.body,
  );
}
