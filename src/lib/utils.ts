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

export function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString("id-ID", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function formatTime(date: Date | string): string {
  return new Date(date).toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
  });
}
