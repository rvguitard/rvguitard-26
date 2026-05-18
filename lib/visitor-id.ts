const visitorIdKey = "rvg-visitor-id";

export function getVisitorId() {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const savedVisitorId = window.localStorage.getItem(visitorIdKey);

    if (savedVisitorId) {
      return savedVisitorId;
    }

    const nextVisitorId = window.crypto.randomUUID();
    window.localStorage.setItem(visitorIdKey, nextVisitorId);

    return nextVisitorId;
  } catch {
    return null;
  }
}
