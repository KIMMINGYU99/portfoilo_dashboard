export function getProjectThumbnailUrl(details: any): string | null {
  if (!details || typeof details !== "object") return null;
  const t = typeof details.thumbnail === "string" ? details.thumbnail : "";
  const images = Array.isArray(details.images) ? details.images : [];
  let url: string | null = t || images[0] || "" || null;
  if (!url) return null;
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  return `/assets/${url}`;
}
