import Image from "next/image";

type BrandLogoProps = {
  variant?: "full" | "compact";
  className?: string;
  priority?: boolean;
};

export function BrandLogo({
  variant = "full",
  className,
  priority = false,
}: BrandLogoProps) {
  const compact = variant === "compact";

  return (
    <Image
      src={
        compact
          ? "/brand/icons/sas-logo-512.png"
          : "/brand/logos/sas-logo-for%20white%20background.png"
      }
      alt={
        compact
          ? "العلامة المعتمدة لساس"
          : "منصة ساس للإعلام والدراسات"
      }
      width={compact ? 512 : 1473}
      height={compact ? 512 : 781}
      sizes={compact ? "56px" : "(max-width: 720px) 120px, 160px"}
      className={[
        compact ? "brand-logo-compact" : "brand-logo-full",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      priority={priority}
    />
  );
}
