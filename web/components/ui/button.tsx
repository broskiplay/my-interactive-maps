import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

/**
 * shadcn/ui Button. Варианты привязаны к готовым классам сайта (css/spatial.css, css/style.css),
 * геометрия и состояния общие с обычным HTML; утилиты Tailwind можно добавлять через className.
 */
const buttonVariants = cva("", {
  variants: {
    variant: {
      primary: "sp-btn sp-primary",
      secondary: "sp-btn",
      ghost: "sp-btn sp-ghost",
      icon: "sp-btn sp-icon",
      pill: "sp-btn", // кнопки-«пилюли» первого экрана
      social: "social-btn", // кнопки соцсетей и доната (цвет — вторым классом: social-donate и т. п.)
    },
  },
  defaultVariants: { variant: "secondary" },
});

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export function Button({ className, variant, asChild = false, ...props }: ButtonProps) {
  const Comp = asChild ? Slot : "button";
  return <Comp className={cn(buttonVariants({ variant }), className)} {...props} />;
}

export { buttonVariants };
