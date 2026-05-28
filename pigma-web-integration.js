;(() => {
  const globalScope = typeof globalThis !== "undefined" ? globalThis : {};
  if (globalScope.__PIGMA_WEB_INTEGRATION_PATCH__) {
    return;
  }

  const originalOnMessage = figma.ui.onmessage;
  const WEB_AUTH_KEY = "pigma:web-auth:v1";
  const DEFAULT_WEB_AUTH = Object.freeze({
    serverUrl: "https://oy-tools-production.up.railway.app",
    accessToken: ""
  });

  if (typeof originalOnMessage !== "function") {
    return;
  }

  figma.ui.onmessage = async message => {
    if (isPigmaWebMessage(message)) {
      if (message.type === "pigma-web-auth-get") {
        await postWebAuthState();
        return;
      }

      if (message.type === "pigma-web-auth-save") {
        await writeWebAuth(message.settings);
        await postWebAuthState();
        figma.notify("Pigma web connection saved.", { timeout: 1600 });
        return;
      }

      if (message.type === "pigma-web-auth-clear") {
        await writeWebAuth(DEFAULT_WEB_AUTH);
        await postWebAuthState();
        figma.notify("Pigma 로그아웃했습니다.", { timeout: 1600 });
        return;
      }

      if (message.type === "pigma-web-open-url") {
        openExternalUrl(message.url);
        return;
      }
    }

    return originalOnMessage(message);
  };

  globalScope.__PIGMA_WEB_INTEGRATION_PATCH__ = true;

  function isPigmaWebMessage(message) {
    return (
      !!message &&
      (message.type === "pigma-web-auth-get" ||
        message.type === "pigma-web-auth-save" ||
        message.type === "pigma-web-auth-clear" ||
        message.type === "pigma-web-open-url")
    );
  }

  async function postWebAuthState() {
    figma.ui.postMessage({
      type: "pigma-web-auth-state",
      state: await readWebAuth()
    });
  }

  async function readWebAuth() {
    try {
      return normalizeWebAuth(await figma.clientStorage.getAsync(WEB_AUTH_KEY));
    } catch (error) {
      return normalizeWebAuth(null);
    }
  }

  async function writeWebAuth(settings) {
    const next = normalizeWebAuth(settings);
    try {
      await figma.clientStorage.setAsync(WEB_AUTH_KEY, next);
    } catch (error) {}
    return next;
  }

  function normalizeWebAuth(value) {
    const source = value && typeof value === "object" ? value : {};
    return {
      serverUrl: normalizeServerUrl(source.serverUrl),
      accessToken: sanitizeAccessToken(source.accessToken)
    };
  }

  function normalizeServerUrl(value) {
    let next = String(value || DEFAULT_WEB_AUTH.serverUrl)
      .replace(/[\u0000-\u001F\u007F-\u009F]/g, "")
      .trim()
      .replace(/\/+$/g, "");

    if (!next) {
      return DEFAULT_WEB_AUTH.serverUrl;
    }

    if (!/^https?:\/\//i.test(next)) {
      next = "https://" + next;
    }

    try {
      return new URL(next).origin;
    } catch (error) {
      return DEFAULT_WEB_AUTH.serverUrl;
    }
  }

  function normalizeExternalUrl(value) {
    let next = String(value || DEFAULT_WEB_AUTH.serverUrl)
      .replace(/[\u0000-\u001F\u007F-\u009F]/g, "")
      .trim()
      .replace(/\/+$/g, "");

    if (!next) {
      return DEFAULT_WEB_AUTH.serverUrl;
    }

    if (!/^https?:\/\//i.test(next)) {
      next = "https://" + next;
    }

    return next;
  }

  function sanitizeAccessToken(value) {
    return String(value || "")
      .replace(/[\u0000-\u001F\u007F-\u009F]/g, "")
      .replace(/[\u200B-\u200D\uFEFF]/g, "")
      .replace(/\s+/g, "")
      .replace(/^['"`]+|['"`]+$/g, "")
      .trim();
  }

  function openExternalUrl(value) {
    const url = normalizeExternalUrl(value);
    try {
      if (typeof figma.openExternal === "function") {
        figma.openExternal(url);
        return;
      }
    } catch (error) {}

    figma.notify("Open this URL in your browser: " + url, { timeout: 3200 });
  }
})();
