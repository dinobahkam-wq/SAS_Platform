import Image from "next/image";

type BrandLogoProps = {
  variant?: "full" | "compact" | "color";
  className?: string;
  priority?: boolean;
};

export function BrandLogo({
  variant = "full",
  className,
  priority = false,
}: BrandLogoProps) {
  const compact = variant === "compact";
  const colored = variant === "color";

  return (
    <Image
      src={
        compact
          ? "/brand/icons/sas-logo-512.png"
          : colored
            ? "/brand/logos/sas%20color%20logo%20for%20the%20white%20background.png"
            : "/brand/logos/sas-logo-for%20white%20background.png"
      }
      alt={
        compact
          ? "العلامة المعتمدة لساس"
          : "منصة ساس للإعلام والدراسات"
      }
      width={compact ? 512 : colored ? 800 : 1473}
      height={compact ? 512 : colored ? 800 : 781}
      sizes={compact ? "56px" : "(max-width: 720px) 120px, 160px"}
      className={[
        compact ? "brand-logo-compact" : colored ? "brand-logo-color" : "brand-logo-full",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      priority={priority}
    />
  );
}
