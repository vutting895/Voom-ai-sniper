"use client";

import React, { useState, useEffect } from "react";

interface BrokerAccount {
  brokerId: string;
  brokerName: string;
  apiKey: string;
  isLocked: boolean;
  isPaperTrading: boolean;
  status: "CONNECTED" | "DISCONNECTED" | "ERROR";
}

const SUPPORTED_BROKERS = [
  { id: "bitkub", name: "Bitkub", icon: "🟢", requirePassphrase: false },
  { id: "binance", name: "Binance", icon: "🟡", requirePassphrase: false },
  { id: "okx", name: "OKX", icon: "⬛", requirePassphrase: true },
  { id: "bybit", name: "Bybit", icon: "🖤", requirePassphrase: false },
];

export default function MultiBrokerManager() {
  const [selectedBroker, setSelectedBroker] = useState("bitkub");
  const [apiKey, setApiKey] = useState("");
  const [apiSecret, setApiSecret] = useState("");
  const [passphrase, setPassphrase] = useState("");
  const [isPaperTrading, setIsPaperTrading] = useState(false);
  const [accounts, setAccounts] = useState<Record<string, BrokerAccount>>({});
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetchBrokerAccounts();
  }, []);

  const fetchBrokerAccounts = async () => {
    try {
      const res = await fetch("/api/broker/auth");
      const data = await res.json();
      if (data.success && data.accounts) {
        setAccounts(data.accounts);
      }
    } catch (err) {
      console.error("Error loading broker accounts:", err);
    }
  };

  const handleConnectAndLock = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    const brokerMeta = SUPPORTED_BROKERS.find((b) => b.id === selectedBroker);

    try {
      const res = await fetch("/api/broker/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          brokerId: selectedBroker,
          brokerName: brokerMeta?.name,
          apiKey,
          apiSecret,
          passphrase,
          isPaperTrading,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setMessage(`เชื่อมต่อและล็อกระบบกับ ${brokerMeta?.name} เรียบร้อยแล้ว!`);
        setApiSecret("");
        setPassphrase("");
        fetchBrokerAccounts();
      } else {
        setMessage(`การเชื่อมต่อล้มเหลว: ${data.message}`);
      }
    } catch (err) {
      setMessage("เกิดข้อผิดพลาดในการเชื่อมต่อโบรคเกอร์");
    } finally {
      setLoading(false);
    }
  };

  const toggleBrokerLock = async (brokerId: string, currentLockState: boolean) => {
    try {
      const res = await fetch("/api/broker/auth", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          brokerId,
          isLocked: !currentLockState,
        }),
      });
      const data = await res.json();
      if (data.success) {
        fetchBrokerAccounts();
      }
    } catch (err) {
      console.error("Failed to toggle lock:", err);
    }
  };

  const currentBrokerMeta = SUPPORTED_BROKERS.find((b) => b.id === selectedBroker);
  const activeAccount = accounts[selectedBroker];

  return (
    <div className="p-6 bg-slate-900 text-white rounded-xl border border-slate-800 max-w-2xl">
      <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
        <span>🔐</span> การจัดการและเชื่อมต่อโบรคเกอร์ (Multi-Broker Auth)
      </h2>

      <div className="grid grid-cols-4 gap-2 mb-6">
        {SUPPORTED_BROKERS.map((b) => {
          const acc = accounts[b.id];
          return (
            <button
              key={b.id}
              type="button"
              onClick={() => {
                setSelectedBroker(b.id);
                setApiKey(acc?.apiKey || "");
              }}
              className={`p-3 rounded-lg border text-sm font-medium flex flex-col items-center gap-1 transition-all ${
                selectedBroker === b.id
                  ? "border-blue-500 bg-blue-950/40 text-blue-300"
                  : "border-slate-800 bg-slate-800/50 text-slate-400 hover:border-slate-700"
              }`}
            >
              <span className="text-lg">{b.icon}</span>
              <span>{b.name}</span>
              {acc?.isLocked ? (
                <span className="text-[10px] px-1.5 py-0.5 bg-green-950 text-green-400 border border-green-800 rounded">
                  🔒 Locked
                </span>
              ) : (
                <span className="text-[10px] text-slate-500">Unlinked</span>
              )}
            </button>
          );
        })}
      </div>

      <form onSubmit={handleConnectAndLock} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-400 mb-1">
            {currentBrokerMeta?.name} API Key
          </label>
          <input
            type="text"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder={`กรอก API Key ของ ${currentBrokerMeta?.name}`}
            className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-400 mb-1">
            {currentBrokerMeta?.name} API Secret
          </label>
          <input
            type="password"
            value={apiSecret}
            onChange={(e) => setApiSecret(e.target.value)}
            placeholder="••••••••••••••••"
            className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-blue-500"
          />
        </div>

        {currentBrokerMeta?.requirePassphrase && (
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1">
              API Passphrase
            </label>
            <input
              type="password"
              value={passphrase}
              onChange={(e) => setPassphrase(e.target.value)}
              placeholder="กรอก Passphrase"
              className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-blue-500"
            />
          </div>
        )}

        <div className="flex items-center gap-2 pt-1">
          <input
            type="checkbox"
            id="paperMode"
            checked={isPaperTrading}
            onChange={(e) => setIsPaperTrading(e.target.checked)}
            className="w-4 h-4 rounded bg-slate-800 border-slate-700 text-blue-600"
          />
          <label htmlFor="paperMode" className="text-sm cursor-pointer text-slate-300">
            โหมด Paper Trading (จำลองการเทรด)
          </label>
        </div>

        {message && (
          <div
            className={`p-3 text-sm rounded-lg ${
              message.includes("เรียบร้อย")
                ? "bg-green-900/40 text-green-300 border border-green-800"
                : "bg-red-900/40 text-red-300 border border-red-800"
            }`}
          >
            {message}
          </div>
        )}

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-lg text-sm transition-colors disabled:opacity-50"
          >
            {loading ? "กำลังตรวจสอบ..." : `ล็อกอิน & ล็อกการเทรด ${currentBrokerMeta?.name}`}
          </button>

          {activeAccount && (
            <button
              type="button"
              onClick={() => toggleBrokerLock(selectedBroker, activeAccount.isLocked)}
              className={`px-4 py-2.5 rounded-lg text-sm font-medium border transition-colors ${
                activeAccount.isLocked
                  ? "bg-amber-950/40 text-amber-300 border-amber-800 hover:bg-amber-900/50"
                  : "bg-green-950/40 text-green-300 border border-green-800 hover:bg-green-900/50"
              }`}
            >
              {activeAccount.isLocked ? "ปลดล็อก (Pause Auto-Trade)" : "ล็อกการเชื่อมต่อ (Lock)"}
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
