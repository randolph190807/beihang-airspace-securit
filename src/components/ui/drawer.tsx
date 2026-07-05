import * as React from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface DrawerContextValue {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const DrawerContext = React.createContext<DrawerContextValue | null>(null);

function useDrawerContext() {
  const context = React.useContext(DrawerContext);
  if (!context) {
    throw new Error("Drawer components must be used within Drawer");
  }
  return context;
}

export function Drawer({
  open,
  onOpenChange,
  children,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
}) {
  React.useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onOpenChange(false);
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, onOpenChange]);

  return (
    <DrawerContext.Provider value={{ open, onOpenChange }}>
      {children}
    </DrawerContext.Provider>
  );
}

export function DrawerContent({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  const { open, onOpenChange } = useDrawerContext();

  if (!open || typeof document === "undefined") return null;

  return createPortal(
    <div className="pointer-events-none fixed inset-y-0 right-0 z-50">
      <div
        className={cn(
          "pointer-events-auto relative flex h-full w-[min(92vw,430px)] flex-col border-l border-cyan-200/10 bg-[#07182e] shadow-[-18px_0_48px_rgba(1,13,35,0.46)]",
          className,
        )}
      >
        <button
          type="button"
          aria-label="关闭抽屉"
          className="absolute right-4 top-4 rounded-md border border-white/10 p-1.5 text-blue-100/60 transition-colors hover:bg-white/5 hover:text-cyan-50"
          onClick={() => onOpenChange(false)}
        >
          <X className="h-4 w-4" />
        </button>
        {children}
      </div>
    </div>,
    document.body,
  );
}

export function DrawerHeader({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("border-b border-cyan-200/10 px-4 py-3", className)} {...props} />;
}

export function DrawerTitle({
  className,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
  return <h2 className={cn("text-base font-semibold text-cyan-50", className)} {...props} />;
}

export function DrawerDescription({
  className,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn("mt-1 text-xs text-blue-100/45", className)} {...props} />;
}
