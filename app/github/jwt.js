import crypto from "node:crypto";

function base64url(input) {
  const buf = Buffer.isBuffer(input) ? input : Buffer.from(String(input));
  return buf
    .toString("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}

function normalizePem(pem) {
  const trimmed = pem.trim();
  if (trimmed.includes("-----BEGIN")) return trimmed;
  return trimmed.replace(/\\n/g, "\n");
}

export function loadPrivateKeyFromEnv(env = process.env) {
  const rawPem = env.GITHUB_PRIVATE_KEY;
  const b64 = env.GITHUB_PRIVATE_KEY_B64;

  if (rawPem && b64) {
    throw new Error(
      "Set only one of GITHUB_PRIVATE_KEY or GITHUB_PRIVATE_KEY_B64",
    );
  }

  if (rawPem) {
    return crypto.createPrivateKey(normalizePem(rawPem));
  }

  if (b64) {
    const decoded = Buffer.from(b64, "base64").toString("utf8");
    return crypto.createPrivateKey(normalizePem(decoded));
  }

  throw new Error(
    "Missing GitHub App private key. Set GITHUB_PRIVATE_KEY or GITHUB_PRIVATE_KEY_B64.",
  );
}

export function createAppJwt({ appId, privateKey, now = Date.now() }) {
  if (!appId) throw new Error("Missing appId");
  if (!privateKey) throw new Error("Missing privateKey");

  const iat = Math.floor(now / 1000) - 10;
  const exp = iat + 9 * 60;

  const header = base64url(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const payload = base64url(JSON.stringify({ iat, exp, iss: String(appId) }));
  const signingInput = `${header}.${payload}`;

  const signature = crypto.sign("RSA-SHA256", Buffer.from(signingInput), {
    key: privateKey,
  });

  return `${signingInput}.${base64url(signature)}`;
}

