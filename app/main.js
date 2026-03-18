import express from "express";
import routes from "./routes.js";

const app = express();
app.use(express.json());

app.get("/", (req, res) => {
  res.status(200).type("text/plain").send("gpucomm-bot up. POST /webhook");
});

app.use("/webhook", routes);

const port = Number.parseInt(process.env.PORT ?? "3000", 10);
const host = process.env.HOST ?? "127.0.0.1";

const server = app.listen(port, host, () => {
  console.log(`gpucomm-bot running on http://${host}:${port}`);
});

server.on("error", (err) => {
  console.error("Failed to start server:", err?.message ?? err);
  process.exitCode = 1;
});
