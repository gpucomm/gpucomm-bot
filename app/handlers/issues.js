import { createGitHubClientFromEnv } from "../github/client.js";

export async function handleIssues(payload) {
  const action = payload.action;
  const issueNumber = payload.issue?.number;
  const title = payload.issue?.title;
  const owner = payload.repository?.owner?.login;
  const repo = payload.repository?.name;

  console.log(`[issues] action=${action} #${issueNumber} "${title}"`);

  if (action === "opened" && title) {
    const isGpu = /gpu|cuda|nvidia/i.test(title);
    if (isGpu) {
      console.log(`[issues] GPU-related issue detected: #${issueNumber}`);

      try {
        const gh = createGitHubClientFromEnv();
        console.log(`[issues] Posting comment on #${issueNumber} for ${owner}/${repo}`);
        await gh.createIssueComment({
          owner,
          repo,
          issueNumber,
          body: `gpucomm-bot: Thanks for opening this issue! It has been tagged for GPU-related triage.`,
        });
        console.log(`[issues] Comment posted on #${issueNumber}`);
      } catch (err) {
        console.error("[issues] GitHub API error:", err?.message ?? err);
      }
    }
  }
}

