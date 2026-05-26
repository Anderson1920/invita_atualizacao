import Image from "next/image";

export function BrandLogo({
  size = "md",
  label = "convites digitais inteligentes",
  showText = true,
}: {
  size?: "sm" | "md" | "lg";
  label?: string;
  showText?: boolean;
}) {
  const imageSize = size === "lg" ? 112 : size === "sm" ? 44 : 58;
  const textSize = size === "lg" ? "text-3xl" : size === "sm" ? "text-lg" : "text-xl";

  return (
    <span className="flex items-center gap-3 text-violet-950">
      <span
        className="relative block shrink-0 overflow-hidden rounded-2xl shadow-xl shadow-violet-200/70"
        style={{ width: imageSize, height: imageSize }}
      >
        <Image
          src="/brand/invita-logo.png"
          alt="Logo Invita"
          fill
          sizes={`${imageSize}px`}
          className="object-cover"
          priority={size === "lg"}
        />
      </span>
      {showText && (
        <span>
          <strong className={`block font-semibold leading-none ${textSize}`}>Invita</strong>
          <small className="mt-1 block text-xs text-violet-500">{label}</small>
        </span>
      )}
    </span>
  );
}
