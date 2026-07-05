import { Toaster as Sonner } from "sonner";

export function Toaster() {
  return (
    <Sonner
      position="top-right"
      richColors
      closeButton
      toastOptions={{
        classNames: {
          toast: "!border !border-cyan-200/10 !bg-[#07182e] !text-cyan-50",
          title: "!text-cyan-50",
          description: "!text-blue-100/70",
          actionButton: "!bg-red-500 !text-white",
          cancelButton: "!bg-white/10 !text-cyan-50",
        },
      }}
    />
  );
}
