// Keeps the dev server alive on :3001. Starts it if nothing is listening,
// restarts it if it dies or starts 500ing (e.g. a parallel build/deploy run
// corrupted the cache). Run: npm run dev:keep
import { spawn, execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "..");
const URL = "http://localhost:3001/";
const CHECK_MS = 10_000;
let child = null;
let badChecks = 0;

function log(msg) {
  console.log(`[watchdog ${new Date().toLocaleTimeString()}] ${msg}`);
}

async function httpStatus() {
  try {
    const res = await fetch(URL, { signal: AbortSignal.timeout(5000) });
    return res.status;
  } catch {
    return 0;
  }
}

function killPort3001() {
  try {
    const out = execSync('netstat -ano -p tcp | findstr ":3001" | findstr "LISTENING"', {
      encoding: "utf8",
    });
    const pids = [...new Set(out.trim().split(/\r?\n/).map((l) => l.trim().split(/\s+/).pop()))];
    for (const pid of pids) {
      if (pid && pid !== "0") {
        try { execSync(`taskkill /F /PID ${pid}`, { stdio: "ignore" }); } catch {}
      }
    }
  } catch {} // nothing listening
}

function startServer(wipeCache) {
  killPort3001();
  if (wipeCache) {
    try {
      fs.rmSync(path.join(ROOT, ".next-dev"), { recursive: true, force: true });
      log("wiped .next-dev");
    } catch {}
  }
  const out = fs.openSync(path.join(ROOT, ".dev-server.out.log"), "a");
  const err = fs.openSync(path.join(ROOT, ".dev-server.err.log"), "a");
  // spawn node directly on next's bin — .cmd shims hit EINVAL on Node 22+ (Windows)
  child = spawn(
    process.execPath,
    [path.join(ROOT, "node_modules", "next", "dist", "bin", "next"), "dev", "--webpack", "-p", "3001"],
    { cwd: ROOT, stdio: ["ignore", out, err], detached: false, shell: false }
  );
  log(`started next dev (pid ${child.pid})`);
  child.on("exit", (code) => {
    log(`dev server exited (code ${code})`);
    child = null;
  });
}

log("watching http://localhost:3001 — Ctrl+C to stop");
const initial = await httpStatus();
if (initial !== 200) startServer(initial !== 0);

setInterval(async () => {
  const status = await httpStatus();
  if (status === 200) {
    badChecks = 0;
    return;
  }
  badChecks++;
  log(`check failed (http ${status}), strike ${badChecks}/2`);
  if (badChecks >= 2) {
    badChecks = 0;
    log("restarting dev server" + (status === 500 ? " with cache wipe (500 = corrupted cache)" : ""));
    startServer(status === 500);
  }
}, CHECK_MS);
