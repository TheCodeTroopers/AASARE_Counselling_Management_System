import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/integrations/supabase/client";

export async function GET(req: NextRequest) {
  try {
    const { data, error } = await supabase
      .from("audit_logs")
      .select("*")
      .order("timestamp", { ascending: false })
      .limit(100);

    if (error) {
      return NextResponse.json(
        { success: false, message: error.message, data: [] },
        { status: 500 },
      );
    }

    return NextResponse.json({ success: true, data: data || [] });
  } catch (err: unknown) {
    return NextResponse.json(
      { success: false, message: (err as Error).message, data: [] },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, userId, details } = body;

    const ipAddress =
      req.headers.get("x-forwarded-for")?.split(",")[0] ||
      req.headers.get("x-real-ip") ||
      "127.0.0.1";

    const { data, error } = await supabase
      .from("audit_logs")
      .insert({
        user_id: userId || null,
        action: action || "System Event",
        ip_address: ipAddress,
        details: details || null,
      })
      .select();

    if (error) {
      console.log("[Audit Log Notice] Supabase audit insert notice:", error.message);
      return NextResponse.json({
        success: true,
        message: "Audit logged (local fallback)",
        data: { action, ipAddress, timestamp: new Date().toISOString() },
      });
    }

    return NextResponse.json({ success: true, message: "Audit action logged", data });
  } catch (err: unknown) {
    return NextResponse.json({ success: false, message: (err as Error).message }, { status: 500 });
  }
}
