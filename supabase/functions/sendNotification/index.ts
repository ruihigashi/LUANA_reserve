
// @ts-nocheck
import { serve } from 'https://deno.land/x/sift@0.4.1/mod.ts';
import admin      from 'npm:firebase-admin@^11';              // ★npm: 形式
import { createClient } from 'npm:@supabase/supabase-js@^2';   // ★npm: 形式

// ---------- Firebase Admin 初期化 ----------
const serviceAccountJson = Deno.readTextFileSync('./serviceAccountKey.json');
const serviceAccount = JSON.parse(serviceAccountJson);

if (!admin.apps.length) {
  admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
}

// ---------- Supabase サーバーキーで接続 ----------
const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
);

// ---------- HTTP エンドポイント ----------
serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 });
  }

  const { user_id, title, body, url = '/admin' } = await req.json();

  // 1) 対象ユーザーの FCM トークンを取得
  const { data: rows, error: dbErr } = await supabase
    .from('fcm_tokens')
    .select('token')
    .eq('user_id', user_id);

  if (dbErr)    return new Response('DB error', { status: 500 });
  if (!rows?.length) return new Response('Token not found', { status: 404 });

  // 2) Firebase へ送信
  const resp = await admin.messaging().sendMulticast({
    tokens: rows.map((r) => r.token),
    notification: { title, body },
    data: { url },               // 通知クリック時に開く URL
  });

  return new Response(JSON.stringify(resp), { status: 200 });
});
