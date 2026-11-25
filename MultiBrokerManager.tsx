"use client";

export default function MultiBrokerManager() {
  return (
    <section className="max-w-2xl rounded-xl border border-slate-800 bg-slate-900 p-6 text-white">
      <h2 className="text-xl font-bold">
        การเชื่อมต่อโบรกเกอร์ถูกปิดใช้งาน
      </h2>
      <div className="mt-4 rounded-lg border border-amber-700 bg-amber-950/40 p-3 text-sm leading-6 text-amber-200">
        ยังไม่มีระบบยืนยันตัวตนแยกผู้ใช้และ encrypted secret storage
        ที่ผ่านการตรวจสอบ จึงปิดการเชื่อมต่อและการจัดการบัญชีทั้งหมดไว้
      </div>
      <p className="mt-3 text-sm leading-6 text-slate-400">
        อย่าป้อน API Key, API Secret, Passphrase หรือข้อมูลเข้าสู่ระบบ MT5
        ในหน้านี้ ระบบจะไม่โหลดข้อมูลบัญชี ไม่เรียก Broker API
        และไม่ส่งคำสั่งซื้อขาย
      </p>
    </section>
  );
}
