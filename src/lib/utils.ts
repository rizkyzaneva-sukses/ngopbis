export const WIB_TZ = "Asia/Jakarta";

export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

export function formatNoWa(noWa: string): string {
  let cleaned = noWa.replace(/\D/g, "");
  if (cleaned.startsWith("0")) {
    cleaned = "62" + cleaned.slice(1);
  }
  if (!cleaned.startsWith("62")) {
    cleaned = "62" + cleaned;
  }
  return cleaned;
}

export function validateNoWa(noWa: string): boolean {
  const cleaned = noWa.replace(/\D/g, "");
  if (cleaned.startsWith("0")) {
    return cleaned.length >= 10 && cleaned.length <= 14;
  }
  if (cleaned.startsWith("62")) {
    return cleaned.length >= 11 && cleaned.length <= 15;
  }
  return false;
}

/** Parse datetime-local / date string as WIB (UTC+7), never as server local/UTC. */
export function parseWibDateTime(value: string | null | undefined): Date | null {
  if (value == null) return null;
  const s = String(value).trim();
  if (!s) return null;

  // Already has explicit offset or Z
  if (/[zZ]$/.test(s) || /[+-]\d{2}:\d{2}$/.test(s)) {
    const d = new Date(s);
    return isNaN(d.getTime()) ? null : d;
  }

  // datetime-local: YYYY-MM-DDTHH:mm or YYYY-MM-DDTHH:mm:ss
  const m = s.match(
    /^(\d{4})-(\d{2})-(\d{2})(?:[T\s](\d{2}):(\d{2})(?::(\d{2}))?)?$/
  );
  if (m) {
    const [, y, mo, d, hh = "00", mm = "00", ss = "00"] = m;
    const iso = `${y}-${mo}-${d}T${hh}:${mm}:${ss}+07:00`;
    const parsed = new Date(iso);
    return isNaN(parsed.getTime()) ? null : parsed;
  }

  const fallback = new Date(s);
  return isNaN(fallback.getTime()) ? null : fallback;
}

/** Value for <input type="datetime-local"> in WIB wall clock. */
export function toDatetimeLocalWib(date: Date | string | null | undefined): string {
  if (date == null || date === "") return "";
  const d = new Date(date);
  if (isNaN(d.getTime())) return "";
  const formatted = new Intl.DateTimeFormat("sv-SE", {
    timeZone: WIB_TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(d);
  // sv-SE → "2026-08-20 15:00"
  return formatted.replace(" ", "T");
}

export function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString("id-ID", {
    timeZone: WIB_TZ,
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function formatTime(date: Date | string): string {
  return new Date(date).toLocaleTimeString("id-ID", {
    timeZone: WIB_TZ,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

export function formatDateTime(date: Date | string): string {
  return new Date(date).toLocaleString("id-ID", {
    timeZone: WIB_TZ,
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}
