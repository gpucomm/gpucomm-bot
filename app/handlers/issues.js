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
    }
  }
}

