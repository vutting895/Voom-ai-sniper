"use client";

import { useState } from "react";

type BridgeSignal = {
  direction: "BUY" | "SELL" | "HOLD";
  confidence: number;
  lot: number;
  stopLoss: number;
  takeProfit: number;
  reason: string;
  source: string;
  executionEnabled: false;
};

export default function BridgePanel() {
  const [busy, setBusy] = useState<"health" | "analyze" | null>(null);
  const [connection, setConnection] = useState<"unknown" | "connected" | "offline">("unknown");
  const [params, setParams] = useState("");
  const [signal, setSignal] = useState<BridgeSignal | null>(null);
  const [message, setMessage] = useState("");

  async function callBridge(action: "health" | "analyze") {
    setBusy(action);
    setMessage("");
    try {
      const response = await fetch(`/api/bridge/${action}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: "{}",
        cache: "no-store",
      });
      const data = await response.json();
      if (!response.ok || data.ok !== true) {
        setConnection("offline");
        setMessage(
          data.error === "bridge_not_configured"
            ? "ยังไม่ได้ตั้งค่า Bridge ใน Vercel Preview"
            : data.error === "rate_limited"
              ? "เรียกถี่เกินไป กรุณารอสักครู่"
              : "เชื่อมต่อ Bridge ไม่สำเร็จ กรุณาตรวจสอบว่าเครื่อง MT5 และ Tunnel ยังทำงาน",
        );
        return;
      }

      setConnection("connected");
      if (action === "health") {
        setParams(typeof data.params === "string" ? data.params : "");
        setMessage("เชื่อมต่อ Python Bridge ได้แล้ว");
      } else if (data.signal && typeof data.signal === "object") {
        setSignal(data.signal as BridgeSignal);
        setMessage("รับผลวิเคราะห์จาก Bridge แล้ว — ไม่มีการส่งคำสั่งซื้อขาย");
      } else {
        setMessage("Bridge ตอบกลับในรูปแบบที่ไม่รู้จัก");
      }
    } catch {
      setConnection("offline");
      setMessage("เรียก API ไม่สำเร็จ กรุณาลองใหม่");
    } finally {
      setBusy(null);
    }
  }

  const badge =
    connection === "connected"
      ? "bg-emerald-950 text-emerald-300 border-emerald-800"
      : connection === "offline"
        ? "bg-red-950 text-red-300 border-red-800"
        : "bg-slate-800 text-slate-300 border-slate-700";

  return (
    <section className="mt-8 rounded-2xl border border-slate-700 bg-slate-950 p-5 text-slate-100 shadow-lg">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold">MT5 Python Bridge</h2>
          <p className="mt-1 text-sm text-slate-400">
            รับสถานะและสัญญาณจาก Bridge บนเครื่อง MT5 ผ่าน HTTPS ที่มี token ป้องกัน
          </p>
        </div>
        <span className={`rounded-full border px-3 py-1 text-xs font-medium ${badge}`}>
          {connection === "connected" ? "CONNECTED" : connection === "offline" ? "OFFLINE" : "NOT CHECKED"}
        </span>
      </div>

      <div className="mt-4 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => void callBridge("health")}
          disabled={busy !== null}
          className="rounded-lg border border-slate-600 px-4 py-2 text-sm hover:bg-slate-800 disabled:opacity-50"
        >
          {busy === "health" ? "กำลังตรวจ..." : "ตรวจการเชื่อมต่อ"}
        </button>
        <button
          type="button"
          onClick={() => void callBridge("analyze")}
          disabled={busy !== null}
          className="rounded-lg bg-sky-600 px-4 py-2 text-sm font-semibold hover:bg-sky-500 disabled:opacity-50"
        >
          {busy === "analyze" ? "กำลังวิเคราะห์..." : "วิเคราะห์สัญญาณ"}
        </button>
      </div>

      {params && (
        <p className="mt-3 break-all rounded-lg bg-slate-900 p-3 font-mono text-xs text-slate-300">
          {params}
        </p>
      )}

      {signal && (
        <div className="mt-4 rounded-xl border border-slate-700 bg-slate-900 p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span className="text-sm text-slate-400">สัญญาณจาก Bridge</span>
            <strong className={signal.direction === "BUY" ? "text-emerald-400" : signal.direction === "SELL" ? "text-rose-400" : "text-amber-300"}>
              {signal.direction}
            </strong>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-3 md:grid-cols-4">
            <div><p className="text-xs text-slate-500">Confidence</p><p className="mt-1 font-semibold">{(signal.confidence * 100).toFixed(0)}%</p></div>
            <div><p className="text-xs text-slate-500">Lot (จาก Bridge)</p><p className="mt-1 font-semibold">{signal.lot.toFixed(2)}</p></div>
            <div><p className="text-xs text-slate-500">Stop Loss</p><p className="mt-1 font-semibold">{signal.stopLoss}</p></div>
            <div><p className="text-xs text-slate-500">Take Profit</p><p className="mt-1 font-semibold">{signal.takeProfit}</p></div>
          </div>
          <p className="mt-3 break-words text-sm text-slate-300">{signal.reason || "ไม่มีรายละเอียดเพิ่มเติม"}</p>
        </div>
      )}

      {message && <p role="status" className="mt-3 text-sm text-slate-300">{message}</p>}
      <p className="mt-4 border-t border-slate-800 pt-3 text-xs text-amber-200">
        โหมดเชื่อมต่อ/วิเคราะห์เท่านั้น — หน้าเว็บนี้ไม่ส่งคำสั่งซื้อขายและไม่สามารถข้าม Risk Guard ของ Bridge ได้
      </p>
    </section>
  );
}
