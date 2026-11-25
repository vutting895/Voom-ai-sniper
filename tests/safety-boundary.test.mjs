import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const read = (path) => readFileSync(new URL(path, import.meta.url), "utf8");

test("Sniper package manifest is valid JSON with executable verification scripts", () => {
  const pkg = JSON.parse(read("../package.json"));
  assert.equal(pkg.scripts.build, "next build");
  assert.equal(pkg.scripts.typecheck, "tsc --noEmit");
  assert.equal(pkg.scripts.test, "node --test");
});

test("Next build does not suppress TypeScript errors", () => {
  assert.doesNotMatch(read("../next.config.mjs"), /ignoreBuildErrors\s*:\s*true/);
});

test("public trade API is disabled and cannot import an order adapter", () => {
  const route = read("../app/api/trade/route.ts");
  assert.match(route, /SNIPER_EXECUTION_DISABLED/);
  assert.match(route, /status:\s*410/);
  assert.doesNotMatch(route, /createBitkubOrder|order_send|fetch\(/i);
});

test("legacy broker credential handler is a disabled tombstone", () => {
  const route = read("../route.ts");
  assert.match(route, /BROKER_CREDENTIALS_DISABLED/);
  assert.match(route, /status:\s*410/);
  assert.doesNotMatch(route, /supabase|api_secret|mt5Password|default-user-id/i);
});

test("MT5 worker cannot initialize a terminal or submit an order", () => {
  const worker = read("../mt5_execution_worker.py");
  assert.match(worker, /QUARANTINED/);
  assert.match(worker, /raise SystemExit/);
  assert.doesNotMatch(worker, /import MetaTrader5|mt5\.initialize|mt5\.login|mt5\.order_send/i);
});
