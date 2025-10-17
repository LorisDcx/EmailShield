export function getApiBaseUrl(): string {
  if (typeof window !== "undefined") {
    return "";
  }

  return (
    process.env.INTERNAL_API_BASE_URL ||
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.URL ||
    "http://localhost:8888"
  );
}

export function buildApiUrl(path: string): string {
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }

  const base = getApiBaseUrl();
  const normalized = path.startsWith("/") ? path : `/${path}`;

  return `${base}${normalized}`;
}
