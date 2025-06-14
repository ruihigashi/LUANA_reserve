// src/hooks/usePush.ts
import { messaging } from '../lib/firebase';            // エイリアス or 相対パスで調整
import { getToken, onMessage } from 'firebase/messaging';
import { createClient } from '@supabase/supabase-js';

// 環境変数（Vite は import.meta.env.*）
const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

/**
 * 通知許可 → FCM トークン取得 → Supabase 保存
 */
export async function registerPush() {
  // ブラウザ外で実行されないようガード
  if (typeof window === 'undefined' || typeof Notification === 'undefined') {
    return;
  }

  // 権限が無ければリクエスト
  if (Notification.permission !== 'granted') {
    const result = await Notification.requestPermission();
    if (result !== 'granted') return; // 拒否されたら終了
  }

  // FCM トークン取得
  const token = await getToken(messaging, {
    vapidKey: import.meta.env.VITE_FCM_VAPID_KEY,
  });
  if (!token) throw new Error('FCM token 取得失敗');

  // ログインユーザー取得
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError || !user) return; // 未ログインならスキップ

  // トークンを upsert
  await supabase
    .from('fcm_tokens')
    .upsert({ user_id: user.id, token });
}

/**
 * フォアグラウンド受信（任意）
 */
export function watchForeground() {
  if (typeof window === 'undefined' || typeof Notification === 'undefined') {
    return;
  }
  onMessage(messaging, (payload) => {
    if (Notification.permission === 'granted') {
      new Notification(payload.notification?.title ?? '通知', {
        body: payload.notification?.body ?? '',
        data: payload.data, // URL などをここに
      });
    }
  });
}
