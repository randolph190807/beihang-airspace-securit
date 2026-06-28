import fs from "node:fs";
import path from "node:path";
import type { IncomingMessage, ServerResponse } from "node:http";
import type { Plugin } from "vite";

const MOCK_ROOT = path.resolve(process.cwd(), "Mock");

interface ApiEnvelope<T = unknown> {
  code: number;
  message: string;
  data: T;
}

function sendJson(res: ServerResponse, status: number, body: ApiEnvelope) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.end(JSON.stringify(body));
}

function readBody(req: IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on("data", (chunk) => chunks.push(Buffer.from(chunk)));
    req.on("end", () => resolve(Buffer.concat(chunks).toString("utf-8")));
    req.on("error", reject);
  });
}

function resolveMockFile(method: string, pathname: string): string | null {
  const relative = pathname.replace(/^\//, "");
  const methodSuffix = method.toLowerCase();

  const candidates: string[] = [];

  if (methodSuffix !== "get") {
    candidates.push(path.join(MOCK_ROOT, `${relative}.${methodSuffix}.json`));
  }

  candidates.push(path.join(MOCK_ROOT, `${relative}.json`));

  const manualTagMatch = pathname.match(
    /^\/api\/v1\/monitoring\/targets\/[^/]+\/manual-tag$/,
  );
  if (manualTagMatch && methodSuffix === "post") {
    candidates.unshift(
      path.join(
        MOCK_ROOT,
        "api/v1/monitoring/targets/manual-tag.post.json",
      ),
    );
  }

  for (const filePath of candidates) {
    if (fs.existsSync(filePath)) {
      return filePath;
    }
  }

  return null;
}

export function mockApiPlugin(): Plugin {
  return {
    name: "mock-api",
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const url = req.url ?? "";
        if (!url.startsWith("/api/")) {
          next();
          return;
        }

        const parsed = new URL(url, "http://localhost");
        const pathname = parsed.pathname;
        const method = (req.method ?? "GET").toUpperCase();

        const mockFile = resolveMockFile(method, pathname);
        if (!mockFile) {
          sendJson(res, 404, {
            code: 40401,
            message: `mock not found: ${method} ${pathname}`,
            data: null,
          });
          return;
        }

        try {
          const raw = fs.readFileSync(mockFile, "utf-8");
          const data = JSON.parse(raw) as unknown;

          if (method === "POST" && pathname.endsWith("/demo/timing")) {
            const bodyText = await readBody(req);
            const body = bodyText ? (JSON.parse(bodyText) as Record<string, unknown>) : {};
            const multiplier = Number(body.speedMultiplier ?? 1);
            const alertToCoreSec = 30;
            sendJson(res, 200, {
              code: 0,
              message: "ok",
              data: {
                speedMultiplier: multiplier,
                alertToCoreSec,
                effectiveAlertToCoreSec: alertToCoreSec / multiplier,
              },
            });
            return;
          }

          if (method === "POST" && pathname.endsWith("/manual-tag")) {
            const bodyText = await readBody(req);
            const body = bodyText ? (JSON.parse(bodyText) as Record<string, unknown>) : {};
            const targetId = pathname.split("/")[5] ?? "U-002";
            const tag = String(body.tag ?? "alert");
            const effectiveSegment =
              tag === "alert" ? "alert" : tag === "warning" ? "warning" : "unknown";
            sendJson(res, 200, {
              code: 0,
              message: "ok",
              data: {
                targetId,
                manualOverride: tag,
                effectiveSegment,
                threatLevel: tag === "alert" ? "alert" : tag === "warning" ? "warning" : "normal",
              },
            });
            return;
          }

          sendJson(res, 200, { code: 0, message: "ok", data });
        } catch (error) {
          sendJson(res, 500, {
            code: 50000,
            message: error instanceof Error ? error.message : "mock read failed",
            data: null,
          });
        }
      });
    },
  };
}
