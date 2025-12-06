import { forwardRef } from "react";
import { cn } from "@/lib/utils";

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: string;
  label?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, error, label, id, ...props }, ref) => {
    const textareaId = id || props.name;

    return (
      <div className="space-y-2">
        {label && (
          <label
            htmlFor={textareaId}
            className="block text-sm font-medium"
          >
            {label}
          </label>
        )}
        <textarea
          id={textareaId}
          className={cn(
            "w-full px-4 py-3 rounded-lg border bg-[var(--background)] resize-none",
            "focus:outline-none focus:ring-2 focus:ring-[var(--ring)]",
            "placeholder:text-[var(--muted-foreground)]",
            "disabled:cursor-not-allowed disabled:opacity-50",
            error
              ? "border-red-500 focus:ring-red-500"
              : "border-[var(--border)]",
            className
          )}
          ref={ref}
          {...props}
        />
        {error && (
          <p className="text-sm text-red-500">{error}</p>
        )}
      </div>
    );
  }
);

Textarea.displayName = "Textarea";
