// src/hooks/usePush.ts
import { messaging, getFCMToken, sendNotificationToAdmin } from '../lib/firebase';
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
  const token = await getFCMToken();
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
 * 管理者のFCMトークンを保存する関数
 */
export async function registerAdminToken(token: string) {
  try {
    await supabase
      .from('fcm_tokens')
      .upsert({ 
        user_id: 'admin', 
        token,
        is_admin: true 
      });
    console.log('管理者トークンが保存されました');
  } catch (error) {
    console.error('管理者トークン保存エラー:', error);
    throw error;
  }
}

/**
 * 管理者に通知を送信する関数（改善版）
 */
export async function notifyAdmin(title: string, body: string, data?: any) {
  try {
    console.log('管理者通知送信開始:', { title, body, data });
    
    // まず管理者のFCMトークンが存在するかチェック
    const { data: tokens, error: tokenError } = await supabase
      .from('fcm_tokens')
      .select('token')
      .eq('user_id', 'admin')
      .eq('is_admin', true);

    if (tokenError) {
      console.error('管理者トークン取得エラー:', tokenError);
      throw new Error('管理者トークンの取得に失敗しました');
    }

    if (!tokens || tokens.length === 0) {
      console.warn('管理者トークンが見つかりません。通知を送信できません。');
      return; // エラーではなく警告として処理
    }

    console.log(`${tokens.length}件の管理者トークンが見つかりました`);

    // 通知送信
    const result = await sendNotificationToAdmin(title, body, data);
    console.log('管理者通知送信成功:', result);
    
    return result;
  } catch (error) {
    console.error('管理者通知送信エラー:', error);
    
    // エラーの詳細をログに出力
    if (error instanceof Error) {
      console.error('エラー詳細:', error.message);
      console.error('エラースタック:', error.stack);
    }
    
    // 通知エラーは予約処理を止めないため、エラーを再スローしない
    // 代わりにコンソールにログを出力
  }
}

/**
 * フォアグラウンド受信（任意）
 */
export function watchForeground() {
  if (typeof window === 'undefined' || typeof Notification === 'undefined') {
    return;
  }
  onMessage(messaging, (payload) => {
    console.log('フォアグラウンドで通知を受信:', payload);
    
    if (Notification.permission === 'granted') {
      const notification = new Notification(payload.notification?.title ?? '通知', {
        body: payload.notification?.body ?? '',
        data: payload.data, // URL などをここに
        icon: '/favicon.svg',
        badge: '/favicon.svg',
        tag: 'reservation-notification',
        requireInteraction: true,
      });

      // 通知クリック時の処理
      notification.onclick = () => {
        window.focus();
        notification.close();
        
        // データにURLがあれば遷移
        if (payload.data?.url) {
          window.location.href = payload.data.url;
        }
      };
    }
  });
}

// getFCMToken関数をエクスポート
export { getFCMToken };
