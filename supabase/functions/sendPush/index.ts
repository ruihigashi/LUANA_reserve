// @ts-nocheck
import { serve } from "https://deno.land/std@0.167.0/http/server.ts";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  // Content-Type に加え、apikey と Authorization を許可
  "Access-Control-Allow-Headers": "Content-Type, apikey, Authorization",
};

serve(async (req) => {

  console.log("▶︎ APP_ID:", Deno.env.get("ONE_SIGNAL_APP_ID"));
  console.log("▶︎ API_KEY:", Deno.env.get("ONE_SIGNAL_API_KEY")?.slice(0, 5) + "…");
  // プリフライト（OPTIONS）はヘッダーだけ返して終わり
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: CORS_HEADERS });
  }

  try {
    const { customerName, reservationTime } = await req.json();
    const payload = {
      app_id: Deno.env.get("ONE_SIGNAL_APP_ID"),
      headings: { en: "【管理者通知】新しい予約が入りました" },
      contents: { en: `${customerName} 様が ${reservationTime} に予約しました` },
      included_segments: ["Subscribed Users"],
    };

    const resp = await fetch("https://onesignal.com/api/v1/notifications", {
      method: "POST",
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        Authorization: `Basic ${Deno.env.get("ONE_SIGNAL_API_KEY")}`,
      },
      body: JSON.stringify(payload),
    });

    if (!resp.ok) {
      console.error("OneSignal Error:", await resp.text());
      return new Response("Notification Failed", {
        status: 500,
        headers: CORS_HEADERS,
      });
    }

    return new Response("OK", { status: 200, headers: CORS_HEADERS });
  } catch (err) {
    console.error("Function Error:", err);
    return new Response("Internal Error", {
      status: 500,
      headers: CORS_HEADERS,
    });
  }
});
