import { cn } from "@/lib/utils";

type BadgeVariant = "default" | "success" | "warning" | "error" | "info";

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  children: React.ReactNode;
}

const variantStyles: Record<BadgeVariant, string> = {
  default: "bg-[var(--secondary)] text-[var(--foreground)]",
  success: "bg-green-500/10 text-green-500",
  warning: "bg-yellow-500/10 text-yellow-500",
  error: "bg-red-500/10 text-red-500",
  info: "bg-blue-500/10 text-blue-500",
};

export function Badge({
  variant = "default",
  className,
  children,
  ...props
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-1 rounded text-xs font-medium",
        variantStyles[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}

// Pomocnicze mapowanie statusów materiałów
export const materialStatusBadge: Record<string, { label: string; variant: BadgeVariant }> = {
  pending: { label: "Oczekuje", variant: "default" },
  processing: { label: "Przetwarzanie", variant: "warning" },
  completed: { label: "Gotowy", variant: "success" },
  failed: { label: "Błąd", variant: "error" },
};

// Pomocnicze mapowanie statusów subskrypcji
export const subscriptionStatusBadge: Record<string, { label: string; variant: BadgeVariant }> = {
  inactive: { label: "Nieaktywna", variant: "default" },
  active: { label: "Aktywna", variant: "success" },
  canceled: { label: "Anulowana", variant: "warning" },
  past_due: { label: "Zaległa płatność", variant: "error" },
};
