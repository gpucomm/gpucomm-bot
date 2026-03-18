import express from "express";
import { handlePR } from "./handlers/pr.js";
import { handleIssues } from "./handlers/issues.js";
import { handleRelease } from "./handlers/release.js";

const router = express.Router();

router.post("/", async (req, res) => {
  const event = req.headers["x-github-event"];

  if (event === "pull_request") await handlePR(req.body);
  if (event === "issues") await handleIssues(req.body);
  if (event === "release") await handleRelease(req.body);

  res.sendStatus(200);
});

export default router;

