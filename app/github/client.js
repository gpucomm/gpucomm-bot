import { createInstallationTokenProvider, loadGitHubAppConfig } from "./auth.js";

export function createGitHubClient({ tokenProvider, apiBaseUrl }) {
  async function request(method, path, { body } = {}) {
    const token = await tokenProvider();
    const url = new URL(path, apiBaseUrl);

    const res = await fetch(url, {
      method,
      headers: {
        Authorization: `token ${token}`,
        Accept: "application/vnd.github+json",
        "Content-Type": "application/json",
        "X-GitHub-Api-Version": "2022-11-28",
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(
        `GitHub API ${method} ${path} failed: ${res.status} ${res.statusText}${text ? `: ${text}` : ""}`,
      );
    }

    if (res.status === 204) return null;
    return res.json();
  }

  return {
    request,
    async createIssueComment({ owner, repo, issueNumber, body }) {
      return request("POST", `/repos/${owner}/${repo}/issues/${issueNumber}/comments`, {
        body: { body },
      });
    },
    async addLabels({ owner, repo, issueNumber, labels }) {
      return request("POST", `/repos/${owner}/${repo}/issues/${issueNumber}/labels`, {
        body: { labels },
      });
    },
  };
}

export function createGitHubClientFromEnv(env = process.env) {
  const config = loadGitHubAppConfig(env);
  const tokenProvider = createInstallationTokenProvider(config);
  return createGitHubClient({ tokenProvider, apiBaseUrl: config.apiBaseUrl });
}

