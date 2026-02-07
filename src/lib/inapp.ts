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
