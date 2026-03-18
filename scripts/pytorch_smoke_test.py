import sys


def main() -> int:
    import torch

    print("torch:", torch.__version__)
    print("torch.version.cuda:", torch.version.cuda)
    print("cuda available:", torch.cuda.is_available())

    if not torch.cuda.is_available():
        print("ERROR: torch.cuda.is_available() is False")
        return 1

    x = torch.randn(1024, device="cuda")
    y = x * 2
    torch.cuda.synchronize()

    print("pytorch cuda smoke test OK:", y.mean().item())
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

