export async function handleRelease(payload) {
  const action = payload.action;
  const releaseName = payload.release?.name;
  const tag = payload.release?.tag_name;
  const isDraft = payload.release?.draft;
  const isPrerelease = payload.release?.prerelease;

  console.log(`[release] action=${action} tag=${tag} name="${releaseName}"`);

  if (action === "published" && !isDraft) {
    console.log("[release] Running GPU benchmarks...");
    
    if (!isPrerelease) {
      console.log("[release] Full benchmark suite for stable release");
    } else {
      console.log("[release] Quick benchmark for prerelease");
    }
  }
}

