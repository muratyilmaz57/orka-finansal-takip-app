export function formatDate(value: unknown, locale = "tr-TR"): string | null {
  if (!value) return null;

  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) return null;

    if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
      return trimmed;
    }

    const parsed = Date.parse(trimmed);
    if (!Number.isNaN(parsed)) {
      return new Date(parsed).toLocaleDateString(locale);
    }

    const digitsOnly = trimmed.replace(/[^0-9]/g, "");
    if (digitsOnly.length === 8) {
      const year = digitsOnly.slice(0, 4);
      const month = digitsOnly.slice(4, 6);
      const day = digitsOnly.slice(6, 8);
      return `${year}-${month}-${day}`;
    }
  }

  if (typeof value === "number") {
    if (!Number.isFinite(value)) return null;
    if (value > 1e12) {
      return new Date(value).toLocaleDateString(locale);
    }
    if (value > 1e5) {
      const year = Math.floor(value / 10000);
      const month = Math.floor((value % 10000) / 100);
      const day = value % 100;
      return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    }
  }

  return null;
}

