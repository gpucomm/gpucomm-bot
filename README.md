# gpucomm-bot

GPU-aware automation and CI engine for the gpucomm organization.

## Features
- GPU / CUDA validation in PRs
- CI checks for compute pipelines
- Benchmark triggers before release
- Issue and PR automation

## Commands
- /gpu-check → run GPU validation
- /benchmark → run performance tests
- /pause → pause automation
- /analyze → manual validation

## Philosophy
Minimal, GPU-focused, automation-first.

## Next steps
Next step depends on what you want this bot to do in GitHub (right now it just logs events). The usual “make it real” path is:

1) Secure the webhook: verify `X-Hub-Signature-256` with a `WEBHOOK_SECRET` so random POSTs can’t trigger actions.
2) Connect it to GitHub:
   - Easiest: repo/org Webhook pointing to `POST /webhook` (for local dev you’ll need a tunnel like `ngrok` / Cloudflare Tunnel).
   - Best long-term: a GitHub App + webhook + installation tokens (lets the bot comment, label, run checks, etc.).
3) Turn logs into actions: on PR open/update, post a comment / apply labels / set a “GPU required” check; on release, trigger benchmark workflow.
4) Make GPU CI real: add a self-hosted GPU runner and switch `gpu.yml` to run actual CUDA tests/benchmarks.
