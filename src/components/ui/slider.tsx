import * as React from "react";
import * as SliderPrimitive from "@radix-ui/react-slider";
import { cn } from "@/lib/utils";

const Slider = React.forwardRef<
  React.ElementRef<typeof SliderPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root>
>(({ className, orientation = "horizontal", ...props }, ref) => (
  <SliderPrimitive.Root
    ref={ref}
    orientation={orientation}
    className={cn(
      "relative flex w-full touch-none select-none items-center data-[orientation=vertical]:h-full data-[orientation=vertical]:w-4 data-[orientation=vertical]:flex-col",
      className,
    )}
    {...props}
  >
    <SliderPrimitive.Track
      className={cn(
        "relative h-1.5 w-full grow overflow-hidden rounded-full bg-white/10 data-[orientation=vertical]:h-full data-[orientation=vertical]:w-1.5",
      )}
    >
      <SliderPrimitive.Range className="absolute h-full bg-cyan-400 data-[orientation=vertical]:w-full" />
    </SliderPrimitive.Track>
    <SliderPrimitive.Thumb className="block h-3.5 w-3.5 rounded-full border border-cyan-100/30 bg-cyan-50 shadow transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300 disabled:pointer-events-none disabled:opacity-50" />
  </SliderPrimitive.Root>
));

Slider.displayName = SliderPrimitive.Root.displayName;

export { Slider };
