import crypto from "crypto";

export function verifyWebhookSignature(payload, signature, secret) {
  if (!signature || !secret) return false;
  const expected = "sha256=" + crypto
    .createHmac("sha256", secret)
    .update(JSON.stringify(payload))
    .digest("hex");
  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
}
