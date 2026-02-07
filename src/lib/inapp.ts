export function isInAppBrowser(userAgent: string) {
  const ua = userAgent.toLowerCase();
  return (
    ua.includes("fbav") ||
    ua.includes("fban") ||
    ua.includes("instagram") ||
    ua.includes("line") ||
    ua.includes("wechat") ||
    ua.includes("micromessenger") ||
    ua.includes("snapchat") ||
    ua.includes("gmail") ||
    ua.includes("gsa") ||
    ua.includes("twitter") ||
    ua.includes("tiktok")
  );
}

export function getPreferredBrowserLabel(userAgent: string) {
  const ua = userAgent.toLowerCase();
  if (ua.includes("iphone") || ua.includes("ipad") || ua.includes("ipod")) {
    return "Safari";
  }
  if (ua.includes("android")) {
    return "Chrome";
  }
  return "your browser";
}
