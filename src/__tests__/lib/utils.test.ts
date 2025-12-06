import { describe, it, expect } from "vitest";
import { cn } from "@/lib/utils";

describe("cn utility function", () => {
  describe("Basic functionality", () => {
    it("should return empty string for no arguments", () => {
      expect(cn()).toBe("");
    });

    it("should return single class as-is", () => {
      expect(cn("text-red-500")).toBe("text-red-500");
    });

    it("should merge multiple classes", () => {
      expect(cn("text-red-500", "bg-blue-500")).toBe("text-red-500 bg-blue-500");
    });

    it("should handle undefined values", () => {
      expect(cn("text-red-500", undefined, "bg-blue-500")).toBe(
        "text-red-500 bg-blue-500"
      );
    });

    it("should handle null values", () => {
      expect(cn("text-red-500", null, "bg-blue-500")).toBe(
        "text-red-500 bg-blue-500"
      );
    });

    it("should handle false values", () => {
      expect(cn("text-red-500", false, "bg-blue-500")).toBe(
        "text-red-500 bg-blue-500"
      );
    });

    it("should handle empty string values", () => {
      expect(cn("text-red-500", "", "bg-blue-500")).toBe(
        "text-red-500 bg-blue-500"
      );
    });
  });

  describe("Conditional classes", () => {
    it("should include class when condition is true", () => {
      const isActive = true;
      expect(cn("base", isActive && "active")).toBe("base active");
    });

    it("should exclude class when condition is false", () => {
      const isActive = false;
      expect(cn("base", isActive && "active")).toBe("base");
    });

    it("should handle ternary conditions", () => {
      const isActive = true;
      expect(cn("base", isActive ? "active" : "inactive")).toBe("base active");
    });
  });

  describe("Object syntax", () => {
    it("should include classes with true values", () => {
      expect(cn({ "text-red-500": true, "bg-blue-500": true })).toBe(
        "text-red-500 bg-blue-500"
      );
    });

    it("should exclude classes with false values", () => {
      expect(cn({ "text-red-500": true, "bg-blue-500": false })).toBe(
        "text-red-500"
      );
    });

    it("should handle mixed object and string syntax", () => {
      expect(cn("base", { "text-red-500": true, "bg-blue-500": false })).toBe(
        "base text-red-500"
      );
    });
  });

  describe("Array syntax", () => {
    it("should handle array of classes", () => {
      expect(cn(["text-red-500", "bg-blue-500"])).toBe("text-red-500 bg-blue-500");
    });

    it("should handle nested arrays", () => {
      expect(cn(["text-red-500", ["bg-blue-500", "p-4"]])).toBe(
        "text-red-500 bg-blue-500 p-4"
      );
    });
  });

  describe("Tailwind merge functionality", () => {
    it("should merge conflicting Tailwind classes", () => {
      expect(cn("p-4", "p-8")).toBe("p-8");
    });

    it("should merge conflicting text colors", () => {
      expect(cn("text-red-500", "text-blue-500")).toBe("text-blue-500");
    });

    it("should merge conflicting background colors", () => {
      expect(cn("bg-red-500", "bg-blue-500")).toBe("bg-blue-500");
    });

    it("should merge conflicting margin classes", () => {
      expect(cn("mt-4", "mt-8")).toBe("mt-8");
    });

    it("should preserve non-conflicting classes", () => {
      expect(cn("p-4", "m-4")).toBe("p-4 m-4");
    });

    it("should merge conflicting flex classes", () => {
      expect(cn("flex-row", "flex-col")).toBe("flex-col");
    });

    it("should handle responsive variants correctly", () => {
      expect(cn("md:p-4", "md:p-8")).toBe("md:p-8");
    });

    it("should handle hover variants correctly", () => {
      expect(cn("hover:bg-red-500", "hover:bg-blue-500")).toBe(
        "hover:bg-blue-500"
      );
    });
  });

  describe("Complex scenarios", () => {
    it("should handle Button component-like usage", () => {
      const variant = "primary";
      const size = "md";
      const result = cn(
        "inline-flex items-center justify-center",
        {
          "bg-primary": variant === "primary",
          "bg-secondary": variant === "secondary",
        },
        {
          "h-8 px-3": size === "sm",
          "h-10 px-4": size === "md",
          "h-12 px-6": size === "lg",
        },
        "custom-class"
      );

      expect(result).toContain("inline-flex");
      expect(result).toContain("bg-primary");
      expect(result).toContain("h-10");
      expect(result).toContain("px-4");
      expect(result).toContain("custom-class");
    });

    it("should allow overriding base styles with custom className", () => {
      const baseClasses = "p-4 text-red-500";
      const customClasses = "p-8 text-blue-500";
      const result = cn(baseClasses, customClasses);

      expect(result).toBe("p-8 text-blue-500");
    });
  });
});
