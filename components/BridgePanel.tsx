"use client";

export default function BridgePanel() {
  return (
    <section
      aria-labelledby="bridge-panel-title"
      className="mt-8 rounded-2xl border border-slate-700 bg-slate-950 p-5 text-slate-100 shadow-lg"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 id="bridge-panel-title" className="text-xl font-semibold">
            MT5 Python Bridge
          </h2>
          <p className="mt-1 text-sm text-slate-400">
            สถานะการเชื่อมต่อ Bridge สำหรับการวิเคราะห์เท่านั้น
          </p>
        </div>
        <span className="rounded-full border border-amber-800 bg-amber-950/40 px-3 py-1 text-xs font-medium text-amber-200">
          DISABLED
        </span>
      </div>

      <div className="mt-4 rounded-lg border border-slate-700 bg-slate-900 p-4">
        <p className="text-sm font-medium text-slate-100">
          ยังไม่เปิดใช้งาน Bridge API
        </p>
        <p className="mt-2 text-sm leading-6 text-slate-400">
          การเรียกสถานะและวิเคราะห์ผ่าน Bridge ถูกปิดไว้จนกว่าจะตรวจสอบ
          authentication, tenant isolation และ Risk Guard ฝั่งเซิร์ฟเวอร์ครบถ้วน
          หน้านี้จะไม่ส่งคำขอไปยัง Bridge และไม่มีการส่งคำสั่งซื้อขาย
        </p>
      </div>
    </section>
  );
}
