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

## Deployment

### Local Development

1. Copy `.env.example` to `.env` and fill in values
2. Install dependencies: `npm install`
3. Start the bot: `npm start`
4. For public webhook access, use [ngrok](https://ngrok.com):
   ```bash
   ngrok http 3000
   ```
   Use the ngrok HTTPS URL + `/webhook` as your GitHub App webhook URL.

### Production (Render)

We tried Railway first but the trial expired. [Render](https://render.com) was used instead with free tier.

1. Create a Render account and connect your GitHub repo
2. Create a Web Service with:
   - Build Command: `npm install`
   - Start Command: `npm start`
   - Plan: Free
3. Add environment variables:
   ```
   PORT=3000
   HOST=0.0.0.0
   WEBHOOK_SECRET=<your-secret>
   GITHUB_APP_ID=<your-app-id>
   GITHUB_INSTALLATION_ID=<your-installation-id>
   GITHUB_PRIVATE_KEY_B64=<base64-encoded-pem>
   GPUCOMM_GPU_LABEL=gpu-required
   ```
4. Update GitHub App webhook URL to: `https://<your-render-url>/webhook`

## GitHub App Setup

1. Create a GitHub App at https://github.com/apps/gpucomm-bot
2. Enable webhook and set URL to your bot's endpoint
3. Set permissions: Pull requests (read/write), Issues (read/write), Contents (read), Metadata (read)
4. Subscribe to events: Pull request, Issues, Release
5. Install the app on your account/org
6. Generate a private key and convert to base64:
   ```bash
   base64 -i private-key.pem | tr -d '\n'
   ```

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
