import { initializeApp } from 'firebase/app';
import { getMessaging, getToken }  from 'firebase/messaging';

/* 1. Vite の環境変数で初期化 */
const firebaseConfig = {
  apiKey:            'AIzaSyBV-LH2wxWi0qdDk97QPmdaW-BcmhO-Gkk',
  projectId:         'luana-b337b',
  messagingSenderId: '702933620606',
  appId:             '1:702933620606:web:4f6e1b3dfa86140c6e452f',
};

const app = initializeApp(firebaseConfig);
export const messaging = getMessaging(app);

// VAPIDキー（Firebase Consoleから取得した実際の値）
const VAPID_KEY = 'BLl31oUG76kR0zJvcNHOOwlxFshCOz97zHqm8XozfQTWJ38CVWIrauKuEjFD-vqjKRAXdMkuKDLC-kj5rRyJeyY';

/**
 * 管理者に通知を送信する関数（改善版）
 */
export async function sendNotificationToAdmin(title: string, body: string, data?: any) {
  try {
    console.log('Netlify Functionsに通知リクエスト送信開始');
    
    // 通知データを準備
    const notificationData = {
      title,
      body,
      data: {
        url: '/admin/appointments', // 予約一覧ページに遷移
        timestamp: new Date().toISOString(),
        ...data
      }
    };

    // サーバーサイドの通知送信エンドポイントを呼び出し
    const response = await fetch('/.netlify/functions/send-notification', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId: 'admin',
        notification: notificationData
      }),
    });

    console.log('Netlify Functionsレスポンス:', response.status, response.statusText);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('通知送信エラーレスポンス:', errorText);
      throw new Error(`通知送信に失敗しました: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();
    console.log('通知送信成功:', result);
    return result;
  } catch (error) {
    console.error('通知送信エラー:', error);
    throw error;
  }
}

/**
 * FCMトークンを取得する関数
 */
export async function getFCMToken(): Promise<string | null> {
  try {
    const token = await getToken(messaging, {
      vapidKey: VAPID_KEY,
    });
    return token;
  } catch (error) {
    console.error('FCMトークン取得エラー:', error);
    return null;
  }
}
