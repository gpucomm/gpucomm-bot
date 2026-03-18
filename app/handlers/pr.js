import { createGitHubClientFromEnv } from "../github/client.js";

function getRepoInfo(payload) {
  const owner = payload?.repository?.owner?.login;
  const repo = payload?.repository?.name;
  const issueNumber = payload?.pull_request?.number;
  return { owner, repo, issueNumber };
}

function looksGpuRelated(title) {
  const t = String(title ?? "").toLowerCase();
  return t.includes("gpu") || t.includes("cuda");
}

export async function handlePR(payload) {
  const title = payload.pull_request.title;

  console.log("PR:", payload.action);

  if (looksGpuRelated(title)) {
    console.log("GPU-related PR detected");
  }

  if (payload.action === "opened") {
    console.log("Running GPU validation...");

    try {
      const { owner, repo, issueNumber } = getRepoInfo(payload);
      if (!owner || !repo || !issueNumber) return;

      const gh = createGitHubClientFromEnv();

      const gpuFlag = looksGpuRelated(title) ? "yes" : "no";
      await gh.createIssueComment({
        owner,
        repo,
        issueNumber,
        body: `gpucomm-bot: PR opened. GPU-related: ${gpuFlag}.`,
      });

      const label = process.env.GPUCOMM_GPU_LABEL;
      if (label && looksGpuRelated(title)) {
        await gh.addLabels({ owner, repo, issueNumber, labels: [label] }).catch(
          (err) => {
            console.warn("Labeling failed:", err?.message ?? err);
          },
        );
      }
    } catch (err) {
      // Keep webhook handler resilient even if auth is not configured yet.
      console.warn("GitHub App auth not configured or failed:", err?.message ?? err);
    }
  }
}
