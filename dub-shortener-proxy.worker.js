// Cloudflare Worker example for Pigma URL shortening.
// Store DUB_API_KEY as a Worker secret, not in the Figma plugin bundle.
//
// Required secret:
//   DUB_API_KEY=dub_xxx
//
// Optional variables:
//   ALLOWED_ORIGIN=https://www.figma.com
//   DUB_DOMAIN=your-domain.com

const DUB_LINKS_API_URL = "https://api.dub.co/links";

export default {
  async fetch(request, env) {
    const corsHeaders = buildCorsHeaders(env);

    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: corsHeaders,
      });
    }

    if (request.method !== "POST") {
      return jsonResponse({ message: "Method not allowed" }, 405, corsHeaders);
    }

    const apiKey = sanitizeApiKey(env && env.DUB_API_KEY);
    if (!apiKey) {
      return jsonResponse({ message: "DUB_API_KEY is not configured" }, 500, corsHeaders);
    }

    let body = null;
    try {
      body = await request.json();
    } catch (error) {
      return jsonResponse({ message: "Invalid JSON body" }, 400, corsHeaders);
    }

    const url = typeof body.url === "string" ? body.url.trim() : "";
    if (!isAllowedDestinationUrl(url)) {
      return jsonResponse({ message: "Invalid destination URL" }, 400, corsHeaders);
    }

    const payload = {
      url,
    };

    const domain = typeof env.DUB_DOMAIN === "string" ? env.DUB_DOMAIN.trim() : "";
    if (domain) {
      payload.domain = domain;
    }

    let dubResponse;
    let dubText = "";
    try {
      dubResponse = await fetch(DUB_LINKS_API_URL, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
      dubText = await dubResponse.text();
    } catch (error) {
      return jsonResponse({ message: "Could not connect to Dub" }, 502, corsHeaders);
    }

    let dubPayload = null;
    if (dubText) {
      try {
        dubPayload = JSON.parse(dubText);
      } catch (error) {
        dubPayload = null;
      }
    }

    if (!dubResponse.ok) {
      return jsonResponse(
        {
          message: normalizeDubError(dubPayload, dubText),
        },
        dubResponse.status,
        corsHeaders
      );
    }

    const shortUrl =
      dubPayload && typeof dubPayload.shortLink === "string" && dubPayload.shortLink.trim()
        ? dubPayload.shortLink.trim()
        : "";

    if (!shortUrl) {
      return jsonResponse({ message: "Dub did not return a short link" }, 502, corsHeaders);
    }

    return jsonResponse({ shortUrl }, 200, corsHeaders);
  },
};

function buildCorsHeaders(env) {
  const origin =
    env && typeof env.ALLOWED_ORIGIN === "string" && env.ALLOWED_ORIGIN.trim()
      ? env.ALLOWED_ORIGIN.trim()
      : "*";

  return {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Max-Age": "86400",
    "Content-Type": "application/json; charset=utf-8",
  };
}

function jsonResponse(payload, status, headers) {
  return new Response(JSON.stringify(payload), {
    status,
    headers,
  });
}

function sanitizeApiKey(value) {
  return String(value || "")
    .replace(/[\u0000-\u001F\u007F-\u009F]/g, "")
    .replace(/[\u200B-\u200D\uFEFF]/g, "")
    .replace(/\s+/g, "")
    .replace(/^['"`]+|['"`]+$/g, "")
    .replace(/[^\x21-\x7E]/g, "")
    .trim();
}

function isAllowedDestinationUrl(value) {
  try {
    const url = new URL(value);
    return url.protocol === "https:" && url.hostname === "www.figma.com";
  } catch (error) {
    return false;
  }
}

function normalizeDubError(payload, text) {
  const data = payload && typeof payload === "object" ? payload : {};
  if (typeof data.message === "string" && data.message.trim()) {
    return data.message.trim();
  }
  if (typeof data.error === "string" && data.error.trim()) {
    return data.error.trim();
  }
  return String(text || "").replace(/\s+/g, " ").trim() || "Dub request failed";
}
