import { useTranslations } from "next-intl";

export function HUDFrame() {
  const t = useTranslations("hudFrame");
  const cornerStyle = {
    width: 22,
    height: 22,
    borderColor: "var(--gold-dim)",
  };

  return (
    <div className="pointer-events-none fixed inset-0 z-40" aria-label={t("label")}>
      {/* Top-left */}
      <div
        className="absolute top-4 left-4 border-l-[1.5px] border-t-[1.5px]"
        style={cornerStyle}
      />
      {/* Top-right */}
      <div
        className="absolute top-4 right-4 border-r-[1.5px] border-t-[1.5px]"
        style={cornerStyle}
      />
      {/* Bottom-left */}
      <div
        className="absolute bottom-4 left-4 border-l-[1.5px] border-b-[1.5px]"
        style={cornerStyle}
      />
      {/* Bottom-right */}
      <div
        className="absolute bottom-4 right-4 border-r-[1.5px] border-b-[1.5px]"
        style={cornerStyle}
      />
    </div>
  );
}
