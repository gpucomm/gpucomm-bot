#include <cuda_runtime.h>

#include <cstdio>
#include <cstdlib>

__global__ void add_one(int* data) {
  int i = threadIdx.x;
  data[i] += 1;
}

static void check(cudaError_t err, const char* msg) {
  if (err == cudaSuccess) return;
  std::fprintf(stderr, "CUDA error: %s: %s\n", msg, cudaGetErrorString(err));
  std::exit(1);
}

int main() {
  int device_count = 0;
  check(cudaGetDeviceCount(&device_count), "cudaGetDeviceCount");
  std::printf("CUDA devices: %d\n", device_count);
  if (device_count <= 0) {
    std::fprintf(stderr, "No CUDA devices detected.\n");
    return 1;
  }

  cudaDeviceProp prop{};
  check(cudaGetDeviceProperties(&prop, 0), "cudaGetDeviceProperties(0)");
  std::printf("Device0: %s (cc %d.%d)\n", prop.name, prop.major, prop.minor);

  constexpr int N = 32;
  int host[N];
  for (int i = 0; i < N; i++) host[i] = i;

  int* dev = nullptr;
  check(cudaMalloc(&dev, N * sizeof(int)), "cudaMalloc");
  check(cudaMemcpy(dev, host, N * sizeof(int), cudaMemcpyHostToDevice), "cudaMemcpy H2D");

  add_one<<<1, N>>>(dev);
  check(cudaGetLastError(), "kernel launch");
  check(cudaDeviceSynchronize(), "cudaDeviceSynchronize");

  check(cudaMemcpy(host, dev, N * sizeof(int), cudaMemcpyDeviceToHost), "cudaMemcpy D2H");
  check(cudaFree(dev), "cudaFree");

  for (int i = 0; i < N; i++) {
    if (host[i] != i + 1) {
      std::fprintf(stderr, "Mismatch at %d: got %d expected %d\n", i, host[i], i + 1);
      return 1;
    }
  }

  std::puts("CUDA smoke test OK");
  return 0;
}

