const FALLBACK_APP_URL = "https://fanfangbianyou.cn/";

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

export function getPublicAppHost() {
  const publicUrl = getPublicAppUrl();

  try {
    return new URL(publicUrl).host;
  } catch {
    return publicUrl.replace(/^https?:\/\//, "").replace(/\/+$/, "");
  }
}
