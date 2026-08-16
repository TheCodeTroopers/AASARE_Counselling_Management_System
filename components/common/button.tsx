import { cn } from "@/utils/cn";

export function Button({
  children,
  variant = "primary",
  type = "button",
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "danger";
}) {
  const styles = {
    primary: "bg-primary text-white hover:bg-[#5b1c44] shadow-sm",
    secondary: "bg-secondary text-primary border border-border hover:bg-[#efe2d6]",
    ghost:
      "bg-white text-text-secondary border border-border hover:border-accent hover:text-primary",
    danger: "bg-danger text-white hover:bg-[#d85a40] shadow-sm",
  };

  return (
    <button
      type={type}
      className={cn(
        "inline-flex items-center justify-center whitespace-nowrap shrink-0 rounded-2xl px-4 py-2 text-sm font-semibold transition-all duration-300 hover:-translate-y-0.5 cursor-pointer",
        styles[variant],
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
