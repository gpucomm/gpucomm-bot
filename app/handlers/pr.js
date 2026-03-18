export async function handlePR(payload) {
  const title = payload.pull_request.title.toLowerCase();

  console.log("PR:", payload.action);

  if (title.includes("gpu") || title.includes("cuda")) {
    console.log("GPU-related PR detected");
  }

  if (payload.action === "opened") {
    console.log("Running GPU validation...");
  }
}

