"use client";

import React, { useState } from "react";

export default function TradeOrderPanel() {
  const [symbol, setSymbol] = useState("XAUUSD");
  const [action, setAction] = useState<"BUY" | "SELL">("BUY");
  const [volume, setVolume] = useState("0.01");
  const [stopLoss, setStopLoss] = useState("");
  const [takeProfit, setTakeProfit] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState("");

  const handleSendOrder = async () => {
    setLoading(true);
    setResult("");

    try {
      const res = await fetch("/api/trade/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          brokerId: "mt5",
          symbol,
          action,
          volume,
          stopLoss,
          takeProfit,
        }),
      });

      const data = await res.json();
      setResult(data.message);
    } catch (err) {
      setResult("เกิดข้อผิดพลาดในการส่งคำสั่ง");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-slate-900 text-white rounded-xl border border-slate-800 max-w-md mt-4">
      <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
        <span>🚀</span> ทดสอบยิงออเดอร์ MT5 (Manual / AI Trigger)
      </h3>

      <div className="space-y-3">
        <div>
          <label className="block text-xs text-slate-400 mb-1">Symbol (คู่เงิน/ทองคำ)</label>
          <input
            type="text"
            value={symbol}
            onChange={(e) => setSymbol(e.target.value)}
            className="w-full p-2 bg-slate-800 border border-slate-700 rounded text-sm text-white"
          />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setAction("BUY")}
            className={`py-2 rounded font-bold text-sm ${
              action === "BUY" ? "bg-green-600 text-white" : "bg-slate-800 text-slate-400"
            }`}
          >
            BUY
          </button>
          <button
            type="button"
            onClick={() => setAction("SELL")}
            className={`py-2 rounded font-bold text-sm ${
              action === "SELL" ? "bg-red-600 text-white" : "bg-slate-800 text-slate-400"
            }`}
          >
            SELL
          </button>
        </div>

        <div>
          <label className="block text-xs text-slate-400 mb-1">Volume (Lots)</label>
          <input
            type="number"
            step="0.01"
            value={volume}
            onChange={(e) => setVolume(e.target.value)}
            className="w-full p-2 bg-slate-800 border border-slate-700 rounded text-sm text-white"
          />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-xs text-slate-400 mb-1">Stop Loss (SL)</label>
            <input
              type="number"
              placeholder="Optional"
              value={stopLoss}
              onChange={(e) => setStopLoss(e.target.value)}
              className="w-full p-2 bg-slate-800 border border-slate-700 rounded text-sm text-white"
            />
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1">Take Profit (TP)</label>
            <input
              type="number"
              placeholder="Optional"
              value={takeProfit}
              onChange={(e) => setTakeProfit(e.target.value)}
              className="w-full p-2 bg-slate-800 border border-slate-700 rounded text-sm text-white"
            />
          </div>
        </div>

        <button
          onClick={handleSendOrder}
          disabled={loading}
          className="w-full mt-2 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded text-sm transition-colors disabled:opacity-50"
        >
          {loading ? "กำลังส่งคำสั่ง..." : `ยิงคำสั่ง ${action} ไปยัง MT5`}
        </button>

        {result && (
          <div className="p-2.5 bg-slate-800 border border-slate-700 rounded text-xs text-slate-300 mt-2">
            {result}
          </div>
        )}
      </div>
    </div>
  );
}
