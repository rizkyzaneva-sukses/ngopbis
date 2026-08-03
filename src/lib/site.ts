export function getSiteUrl(): string {
  const fromEnv = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_SITE_URL;
  if (fromEnv) return fromEnv.replace(/\/$/, "");
  return "https://ngopbis.mudajuara.my.id";
}

export function toAbsoluteUrl(pathOrUrl?: string | null): string | undefined {
  if (!pathOrUrl) return undefined;
  if (pathOrUrl.startsWith("http://") || pathOrUrl.startsWith("https://")) return pathOrUrl;
  return `${getSiteUrl()}${pathOrUrl.startsWith("/") ? pathOrUrl : `/${pathOrUrl}`}`;
}
