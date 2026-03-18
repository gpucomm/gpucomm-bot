import { createAppJwt, loadPrivateKeyFromEnv } from "./jwt.js";

function parseInstallationTokenResponse(json) {
  if (!json || typeof json !== "object") {
    throw new Error("Invalid installation token response");
  }

  if (typeof json.token !== "string" || typeof json.expires_at !== "string") {
    throw new Error("Missing token/expires_at in installation token response");
  }

  return { token: json.token, expiresAt: json.expires_at };
}

function toEpochMs(expiresAt) {
  const ms = Date.parse(expiresAt);
  if (Number.isNaN(ms)) throw new Error(`Invalid expires_at: ${expiresAt}`);
  return ms;
}

export function loadGitHubAppConfig(env = process.env) {
  const appId = env.GITHUB_APP_ID;
  const installationId = env.GITHUB_INSTALLATION_ID;
  const apiBaseUrl = env.GITHUB_API_URL ?? "https://api.github.com";

  if (!appId || !installationId) {
    throw new Error(
      "Missing GITHUB_APP_ID or GITHUB_INSTALLATION_ID environment variables",
    );
  }

  const privateKey = loadPrivateKeyFromEnv(env);

  return {
    appId: String(appId),
    installationId: String(installationId),
    apiBaseUrl,
    privateKey,
  };
}

export function createInstallationTokenProvider(config) {
  let cachedToken = null;
  let cachedExpiryMs = 0;

  return async function getInstallationToken() {
    const now = Date.now();
    if (cachedToken && now < cachedExpiryMs - 60_000) return cachedToken;

    const appJwt = createAppJwt({
      appId: config.appId,
      privateKey: config.privateKey,
      now,
    });

    const url = new URL(
      `/app/installations/${config.installationId}/access_tokens`,
      config.apiBaseUrl,
    );

    const res = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${appJwt}`,
        Accept: "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
      },
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(
        `Failed to create installation token: ${res.status} ${res.statusText}${text ? `: ${text}` : ""}`,
      );
    }

    const json = await res.json();
    const { token, expiresAt } = parseInstallationTokenResponse(json);

    cachedToken = token;
    cachedExpiryMs = toEpochMs(expiresAt);
    return token;
  };
}

