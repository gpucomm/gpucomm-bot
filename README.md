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

## Real GPU CI
`GPU CI` (`.github/workflows/gpu.yml`) is configured for a self-hosted runner with NVIDIA drivers + CUDA toolkit.

- Runner labels: `self-hosted`, `linux`, `x64`, `gpu`
- CUDA smoke test: `bash scripts/gpu-ci.sh` (compiles `scripts/cuda_smoke_test.cu` with `nvcc`)
- PyTorch smoke test: set repo/org variable `PYTORCH_INDEX_URL` (example: `https://download.pytorch.org/whl/cu121`) then run `bash scripts/gpu-ci.sh pytorch`

## GitHub App auth
To let the bot comment/label on PRs, configure these environment variables for the running service:

- `GITHUB_APP_ID`: GitHub App ID
- `GITHUB_INSTALLATION_ID`: installation ID for the target org/repo
- `GITHUB_PRIVATE_KEY` (PEM string) **or** `GITHUB_PRIVATE_KEY_B64` (base64 PEM)
- Optional: `GITHUB_API_URL` (defaults to `https://api.github.com`, set this for GHES)
- Optional: `GPUCOMM_GPU_LABEL` (label name to apply for GPU-related PRs; label should already exist)
