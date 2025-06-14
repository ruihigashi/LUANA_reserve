// @ts-nocheck
import { serve } from "https://deno.land/std@0.167.0/http/server.ts";

serve(async (req) => {
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
    return new Response("Notification Failed", { status: 500 });
  }
  return new Response("OK");
});
