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
