export function parseAmount(value: unknown): number | null {
  if (value === null || value === undefined) return null;

  if (typeof value === "number") {
    if (!Number.isFinite(value)) return null;
    if (Math.abs(value) > 1e4 && Number.isInteger(value)) {
      const scaled = value / 100;
      return Number.parseFloat(scaled.toFixed(2));
    }
    return value;
  }

  if (typeof value === "string") {
    const trimmed = value.trim();
    if (trimmed.length === 0) return null;

    const noSpace = trimmed.replace(/\u00A0/g, "");
    let normalized = noSpace;

    const hasComma = noSpace.includes(",");
    const hasDot = noSpace.includes(".");

    if (hasComma && hasDot) {
      normalized = noSpace.replace(/\./g, "").replace(/,/g, ".");
    } else if (hasComma && !hasDot) {
      normalized = noSpace.replace(/,/g, ".");
    }

    const parsed = Number(normalized);
    return Number.isNaN(parsed) ? null : parsed;
  }

  return null;
}
