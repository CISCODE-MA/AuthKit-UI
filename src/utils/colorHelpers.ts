// src/utils/colorHelpers.ts
const TAILWIND_PREFIXES = ["bg", "text", "border", "fill", "stroke"] as const;
export type TailwindPrefix = typeof TAILWIND_PREFIXES[number];

/**
 * Convert a single color string into a valid Tailwind color class,
 * or return a fallback if invalid.
 */
function toTailwindColorAuto(
  color: string,
  prefix: TailwindPrefix,
  fallbackClass: string
): string {
  if (!color) return fallbackClass;

  if (color.startsWith(`${prefix}-`)) {
    return color; // e.g. "bg-red-500"
  }
  if (color.startsWith("#")) {
    return `${color}`; // e.g. "bg-[#FF9900]"
  }

  // fallback
  return fallbackClass;
}

/**
 * Build a set of Tailwind classes for each color prop in a ColorTheme object.
 *
 * e.g. { bg: "#FF9900", text: "white", border: "border-green-300" } 
 * => returns an object like { bgClass: "bg-[#FF9900]", textClass: "text-white", borderClass: "border-green-300" }
 *
 * You can specify fallback classes for each property if needed,
 * or define a single fallback for all.
 */
export function toTailwindColorClasses(
  theme: {
    bg?: string;
    text?: string;
    border?: string;
    fill?: string;
    stroke?: string;
  },
  fallback?: {
    bg?: string;
    text?: string;
    border?: string;
    fill?: string;
    stroke?: string;
  }
) {
  // Provide defaults if fallback is missing
  const fallbackBg = fallback?.bg || "bg-sky-500";
  const fallbackText = fallback?.text || "text-gray-800";
  const fallbackBorder = fallback?.border || "border-gray-300";
  const fallbackFill = fallback?.fill || "fill-current";
  const fallbackStroke = fallback?.stroke || "stroke-current";

  return {
    bgClass: toTailwindColorAuto(theme.bg ?? "", "bg", fallbackBg),
    textClass: toTailwindColorAuto(theme.text ?? "", "text", fallbackText),
    borderClass: toTailwindColorAuto(theme.border ?? "", "border", fallbackBorder),
    fillClass: toTailwindColorAuto(theme.fill ?? "", "fill", fallbackFill),
    strokeClass: toTailwindColorAuto(theme.stroke ?? "", "stroke", fallbackStroke),
  };
}
