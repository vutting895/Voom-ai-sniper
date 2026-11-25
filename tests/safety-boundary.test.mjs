import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import test from "node:test";

const read = (path) => readFileSync(new URL(path, import.meta.url), "utf8");

test("Sniper package manifest exposes real verification commands", () => {
  const pkg = JSON.parse(read("../package.json"));
  assert.equal(pkg.scripts.build, "next build");
  assert.equal(pkg.scripts.typecheck, "tsc --noEmit");
  assert.equal(pkg.scripts.test, "node --test");
});

test("Next build does not suppress TypeScript errors", () => {
  assert.doesNotMatch(read("../next.config.mjs"), /ignoreBuildErrors\s*:\s*true/);
});

test("public trade API is permanently disabled and cannot call an order adapter", () => {
  const route = read("../app/api/trade/route.ts");
  assert.match(route, /SNIPER_EXECUTION_DISABLED/);
  assert.match(route, /status:\s*410/);
  assert.doesNotMatch(route, /createBitkubOrder|order_send|fetch\(/i);
});

test("legacy root broker credential handler is removed", () => {
  assert.equal(existsSync(new URL("../route.ts", import.meta.url)), false);
});

test("MT5 worker remains import-safe and refuses every order", () => {
  const worker = read("../mt5_execution_worker.py");
  assert.match(worker, /def execute_mt5_order/);
  assert.match(worker, /return False/);
  assert.doesNotMatch(worker, /import MetaTrader5|mt5\.initialize|mt5\.login|mt5\.order_send/i);
});

test("Bridge UI does not call the disabled API or claim a connection", () => {
  const bridge = read("../components/BridgePanel.tsx");
  assert.match(bridge, /DISABLED/);
  assert.doesNotMatch(bridge, /fetch\(/);
  assert.doesNotMatch(bridge, /CONNECTED/);
});

test("broker UI does not collect credentials or call broker endpoints", () => {
  const broker = read("../MultiBrokerManager.tsx");
  assert.match(broker, /ปิดใช้งาน/);
  assert.doesNotMatch(broker, /fetch\(|type=["']password|API Secret|apiSecret|apiKey/i);
});
