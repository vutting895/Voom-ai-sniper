import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import crypto from "crypto";

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || "default-32-char-secret-key-123456";

function encrypt(text: string) {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv("aes-256-cbc", Buffer.from(ENCRYPTION_KEY.padEnd(32).slice(0, 32)), iv);
  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return iv.toString("hex") + ":" + encrypted.toString("hex");
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { brokerId, brokerName, isPaperTrading } = body;
    const userId = "default-user-id";

    let payload: Record<string, any> = {
      user_id: userId,
      broker_id: brokerId,
      broker_name: brokerName,
      is_locked: true,
      is_paper_trading: isPaperTrading,
      status: "CONNECTED",
      last_connected_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    if (brokerId === "mt5") {
      const { mt5Login, mt5Password, mt5Server } = body;
      if (!mt5Login || !mt5Server) {
        return NextResponse.json({ success: false, message: "กรอกข้อมูล MT5 ให้ครบถ้วน" }, { status: 400 });
      }

      const { data: existing } = await supabase
        .from("user_brokers")
        .select("api_secret_encrypted")
        .eq("user_id", userId)
        .eq("broker_id", "mt5")
        .single();

      const encryptedPassword = mt5Password ? encrypt(mt5Password) : existing?.api_secret_encrypted;

      payload = {
        ...payload,
        api_key: `MT5-${mt5Login}`,
        api_secret_encrypted: encryptedPassword,
        mt5_login: parseInt(mt5Login, 10),
        mt5_server: mt5Server,
      };
    } else {
      const { apiKey, apiSecret, passphrase } = body;
      const { data: existing } = await supabase
        .from("user_brokers")
        .select("api_secret_encrypted, passphrase_encrypted")
        .eq("user_id", userId)
        .eq("broker_id", brokerId)
        .single();

      const encryptedSecret = apiSecret ? encrypt(apiSecret) : existing?.api_secret_encrypted;
      const encryptedPassphrase = passphrase ? encrypt(passphrase) : existing?.passphrase_encrypted;

      payload = {
        ...payload,
        api_key: apiKey,
        api_secret_encrypted: encryptedSecret,
        passphrase_encrypted: encryptedPassphrase,
      };
    }

    const { error } = await supabase
      .from("user_brokers")
      .upsert(payload, { onConflict: "user_id,broker_id" });

    if (error) throw error;

    return NextResponse.json({ success: true, message: `Connected and locked with ${brokerName}` });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

export async function GET() {
  try {
    const userId = "default-user-id";
    const { data, error } = await supabase
      .from("user_brokers")
      .select("broker_id, broker_name, api_key, mt5_login, mt5_server, is_locked, is_paper_trading, status")
      .eq("user_id", userId);

    if (error) throw error;

    const accounts: Record<string, any> = {};
    data?.forEach((item) => {
      accounts[item.broker_id] = {
        brokerId: item.broker_id,
        brokerName: item.broker_name,
        apiKey: item.api_key,
        mt5Login: item.mt5_login?.toString(),
        mt5Server: item.mt5_server,
        isLocked: item.is_locked,
        isPaperTrading: item.is_paper_trading,
        status: item.status,
      };
    });

    return NextResponse.json({ success: true, accounts });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const { brokerId, isLocked } = await req.json();
    const userId = "default-user-id";

    const { error } = await supabase
      .from("user_brokers")
      .update({ is_locked: isLocked, updated_at: new Date().toISOString() })
      .eq("user_id", userId)
      .eq("broker_id", brokerId);

    if (error) throw error;

    return NextResponse.json({ success: true, isLocked });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
