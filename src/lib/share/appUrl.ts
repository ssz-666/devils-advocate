const FALLBACK_APP_URL = "https://devils-advocate-mu.vercel.app/";

function ensureTrailingSlash(url: string) {
  return url.endsWith("/") ? url : `${url}/`;
}

export function getPublicAppUrl() {
  const configuredUrl = process.env.NEXT_PUBLIC_APP_URL?.trim();
  if (!configuredUrl) {
    return FALLBACK_APP_URL;
  }

  return ensureTrailingSlash(configuredUrl);
}

