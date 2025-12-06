import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Button } from "@/components/ui/button";

describe("Button Component", () => {
  describe("Rendering", () => {
    it("should render button with children", () => {
      render(<Button>Click me</Button>);
      expect(screen.getByRole("button", { name: "Click me" })).toBeInTheDocument();
    });

    it("should render with default variant and size", () => {
      render(<Button>Default Button</Button>);
      const button = screen.getByRole("button");
      expect(button).toHaveClass("bg-[var(--primary)]");
      expect(button).toHaveClass("h-10");
      expect(button).toHaveClass("px-4");
    });
  });

  describe("Variants", () => {
    it("should render primary variant correctly", () => {
      render(<Button variant="primary">Primary</Button>);
      const button = screen.getByRole("button");
      expect(button).toHaveClass("bg-[var(--primary)]");
      expect(button).toHaveClass("text-[var(--primary-foreground)]");
    });

    it("should render secondary variant correctly", () => {
      render(<Button variant="secondary">Secondary</Button>);
      const button = screen.getByRole("button");
      expect(button).toHaveClass("bg-[var(--secondary)]");
      expect(button).toHaveClass("text-[var(--secondary-foreground)]");
    });

    it("should render outline variant correctly", () => {
      render(<Button variant="outline">Outline</Button>);
      const button = screen.getByRole("button");
      expect(button).toHaveClass("border");
      expect(button).toHaveClass("bg-transparent");
    });

    it("should render ghost variant correctly", () => {
      render(<Button variant="ghost">Ghost</Button>);
      const button = screen.getByRole("button");
      expect(button).toHaveClass("hover:bg-[var(--secondary)]");
    });
  });

  describe("Sizes", () => {
    it("should render small size correctly", () => {
      render(<Button size="sm">Small</Button>);
      const button = screen.getByRole("button");
      expect(button).toHaveClass("h-8");
      expect(button).toHaveClass("px-3");
      expect(button).toHaveClass("text-sm");
    });

    it("should render medium size correctly", () => {
      render(<Button size="md">Medium</Button>);
      const button = screen.getByRole("button");
      expect(button).toHaveClass("h-10");
      expect(button).toHaveClass("px-4");
    });

    it("should render large size correctly", () => {
      render(<Button size="lg">Large</Button>);
      const button = screen.getByRole("button");
      expect(button).toHaveClass("h-12");
      expect(button).toHaveClass("px-6");
      expect(button).toHaveClass("text-lg");
    });
  });

  describe("Custom className", () => {
    it("should merge custom className with base styles", () => {
      render(<Button className="custom-class">Custom</Button>);
      const button = screen.getByRole("button");
      expect(button).toHaveClass("custom-class");
      expect(button).toHaveClass("inline-flex");
    });

    it("should allow overriding styles via className", () => {
      render(<Button className="bg-red-500">Override</Button>);
      const button = screen.getByRole("button");
      expect(button).toHaveClass("bg-red-500");
    });
  });

  describe("Disabled state", () => {
    it("should render disabled button", () => {
      render(<Button disabled>Disabled</Button>);
      const button = screen.getByRole("button");
      expect(button).toBeDisabled();
    });

    it("should have disabled styles", () => {
      render(<Button disabled>Disabled</Button>);
      const button = screen.getByRole("button");
      expect(button).toHaveClass("disabled:pointer-events-none");
      expect(button).toHaveClass("disabled:opacity-50");
    });
  });

  describe("Event handling", () => {
    it("should call onClick when clicked", async () => {
      const user = userEvent.setup();
      const handleClick = vi.fn();
      render(<Button onClick={handleClick}>Click me</Button>);

      await user.click(screen.getByRole("button"));
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it("should not call onClick when disabled", async () => {
      const user = userEvent.setup();
      const handleClick = vi.fn();
      render(
        <Button onClick={handleClick} disabled>
          Disabled
        </Button>
      );

      await user.click(screen.getByRole("button"));
      expect(handleClick).not.toHaveBeenCalled();
    });
  });

  describe("HTML attributes", () => {
    it("should pass through HTML attributes", () => {
      render(
        <Button type="submit" data-testid="submit-btn">
          Submit
        </Button>
      );
      const button = screen.getByTestId("submit-btn");
      expect(button).toHaveAttribute("type", "submit");
    });

    it("should forward ref correctly", () => {
      const ref = { current: null };
      render(<Button ref={ref}>Ref Button</Button>);
      expect(ref.current).toBeInstanceOf(HTMLButtonElement);
    });
  });

  describe("Accessibility", () => {
    it("should be focusable", async () => {
      const user = userEvent.setup();
      render(<Button>Focusable</Button>);

      await user.tab();
      expect(screen.getByRole("button")).toHaveFocus();
    });

    it("should have focus ring styles", () => {
      render(<Button>Focus Ring</Button>);
      const button = screen.getByRole("button");
      expect(button).toHaveClass("focus-visible:ring-2");
    });

    it("should not be focusable when disabled", async () => {
      const user = userEvent.setup();
      render(
        <>
          <Button disabled>Disabled</Button>
          <Button>Enabled</Button>
        </>
      );

      await user.tab();
      expect(screen.getByRole("button", { name: "Enabled" })).toHaveFocus();
    });
  });

  describe("Combinations", () => {
    it("should handle variant and size together", () => {
      render(
        <Button variant="outline" size="lg">
          Outline Large
        </Button>
      );
      const button = screen.getByRole("button");
      expect(button).toHaveClass("border");
      expect(button).toHaveClass("h-12");
      expect(button).toHaveClass("px-6");
    });

    it("should handle all props together", () => {
      const handleClick = vi.fn();
      render(
        <Button
          variant="secondary"
          size="sm"
          className="extra-class"
          onClick={handleClick}
          type="button"
        >
          Full Props
        </Button>
      );
      const button = screen.getByRole("button");
      expect(button).toHaveClass("bg-[var(--secondary)]");
      expect(button).toHaveClass("h-8");
      expect(button).toHaveClass("extra-class");
      expect(button).toHaveAttribute("type", "button");
    });
  });
});
