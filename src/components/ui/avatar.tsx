import { cn } from "@/lib/utils";

interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  src?: string | null;
  alt?: string;
  fallback?: string;
  size?: "sm" | "md" | "lg";
}

const sizeStyles = {
  sm: "w-8 h-8 text-xs",
  md: "w-10 h-10 text-sm",
  lg: "w-14 h-14 text-lg",
};

export function Avatar({
  src,
  alt,
  fallback,
  size = "md",
  className,
  ...props
}: AvatarProps) {
  const initials = fallback
    ? fallback
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "?";

  if (src) {
    return (
      <div
        className={cn(
          "rounded-full overflow-hidden flex-shrink-0",
          sizeStyles[size],
          className
        )}
        {...props}
      >
        <img
          src={src}
          alt={alt || "Avatar"}
          className="w-full h-full object-cover"
        />
      </div>
    );
  }

  return (
    <div
      className={cn(
        "rounded-full bg-[var(--primary)]/10 flex items-center justify-center text-[var(--primary)] font-medium flex-shrink-0",
        sizeStyles[size],
        className
      )}
      {...props}
    >
      {initials}
    </div>
  );
}
