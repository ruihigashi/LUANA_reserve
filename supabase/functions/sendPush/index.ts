// @ts-nocheck
import { serve } from "https://esm.sh/deno_std@0.167.0/http/server.ts";
import webPush from "https://esm.sh/web-push";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

webPush.setVapidDetails(
  "mailto:you@example.com",
  Deno.env.get("VAPID_PUBLIC_KEY")!,
  Deno.env.get("VAPID_PRIVATE_KEY")!
);

serve(async (req) => {
  const { title, body, url } = await req.json();
  const { data: subs } = await supabase
    .from("push_subscriptions")
    .select("subscription");
  await Promise.all(
    (subs ?? []).map((row: any) =>
      webPush.sendNotification(
        row.subscription,
        JSON.stringify({ title, body, url })
      )
    )
  );
  return new Response(JSON.stringify({ success: true }), { status: 200 });
});
