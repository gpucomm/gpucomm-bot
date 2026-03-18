#!/bin/bash
set -euo pipefail

mode="${1:-cuda}"

echo "== gpucomm-bot: GPU CI ($mode) =="

if ! command -v nvidia-smi >/dev/null 2>&1; then
  echo "ERROR: nvidia-smi not found. This runner does not appear to have an NVIDIA GPU driver installed."
  exit 1
fi

nvidia-smi

if [[ "$mode" == "cuda" ]]; then
  if ! command -v nvcc >/dev/null 2>&1; then
    echo "ERROR: nvcc not found. Install the CUDA toolkit on this self-hosted runner."
    exit 1
  fi

  nvcc --version

  out_bin="$(mktemp -t cuda-smoke-XXXXXX)"
  rm -f "$out_bin"

  echo "Compiling scripts/cuda_smoke_test.cu -> $out_bin"
  nvcc -O2 -std=c++17 scripts/cuda_smoke_test.cu -o "$out_bin"
  echo "Running $out_bin"
  "$out_bin"
  exit 0
fi

if [[ "$mode" == "pytorch" ]]; then
  if ! command -v python3 >/dev/null 2>&1; then
    echo "ERROR: python3 not found on runner."
    exit 1
  fi

  python3 -V

  python3 -m venv .venv
  # shellcheck disable=SC1091
  source .venv/bin/activate

  pip install --upgrade pip

  if [[ -n "${PYTORCH_INDEX_URL:-}" ]]; then
    echo "Installing torch from PYTORCH_INDEX_URL=$PYTORCH_INDEX_URL"
    pip install torch --index-url "$PYTORCH_INDEX_URL"
  else
    echo "ERROR: PYTORCH_INDEX_URL is not set. Configure repo/org variable PYTORCH_INDEX_URL for CUDA wheels."
    echo "Example: https://download.pytorch.org/whl/cu121"
    exit 1
  fi

  python scripts/pytorch_smoke_test.py
  exit 0
fi

echo "ERROR: unknown mode '$mode' (expected: cuda|pytorch)"
exit 2

