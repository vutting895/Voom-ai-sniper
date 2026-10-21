import "server-only";

type ProxyResult = { status: number; body: Record<string, unknown> };

const lastRequestAt = new Map<string, number>();
const MIN_INTERVAL_MS = 1000;

export async function proxyBridgeRequest(
  request: Request,
  endpoint: "health" | "analyze",
): Promise<ProxyResult> {
  const origin = request.headers.get("origin");
  const expectedOrigin = new URL(request.url).origin;
  if (!origin || origin !== expectedOrigin) {
    return { status: 403, body: { ok: false, error: "same_origin_required" } };
  }

  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  const ip = forwarded || request.headers.get("x-real-ip") || "unknown";
  const rateKey = ip + ":" + endpoint;
  const now = Date.now();
  const last = lastRequestAt.get(rateKey) || 0;
  if (now - last < MIN_INTERVAL_MS) {
    return { status: 429, body: { ok: false, error: "rate_limited" } };
  }
  lastRequestAt.set(rateKey, now);
  if (lastRequestAt.size > 2000) {
    for (const [key, at] of lastRequestAt) {
      if (now - at > 60_000) lastRequestAt.delete(key);
    }
  }

  const baseUrl = process.env.VOOM_BRIDGE_URL?.trim();
  const token = process.env.VOOM_BRIDGE_TOKEN?.trim();
  if (!baseUrl || !token) {
    return { status: 503, body: { ok: false, error: "bridge_not_configured" } };
  }

  try {
    const base = baseUrl.endsWith("/") ? baseUrl : baseUrl + "/";
    const url = new URL(endpoint, base);
    const response = await fetch(url, {
      method: endpoint === "health" ? "GET" : "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        ...(endpoint === "analyze" ? { "Content-Type": "application/json" } : {}),
      },
      ...(endpoint === "analyze" ? { body: "{}" } : {}),
      cache: "no-store",
      signal: AbortSignal.timeout(endpoint === "analyze" ? 27_000 : 7_000),
    });

    const data: unknown = await response.json().catch(() => null);
    if (!response.ok || !data || typeof data !== "object") {
      return {
        status: response.status === 429 ? 429 : 502,
        body: { ok: false, error: response.status === 429 ? "bridge_rate_limited" : "bridge_unavailable" },
      };
    }
    return { status: 200, body: data as Record<string, unknown> };
  } catch (error) {
    const timedOut = error instanceof Error && error.name === "TimeoutError";
    return {
      status: timedOut ? 504 : 503,
      body: { ok: false, error: timedOut ? "bridge_timeout" : "bridge_unavailable" },
    };
  }
}
