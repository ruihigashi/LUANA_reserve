const { createClient } = require('@supabase/supabase-js');
const admin = require('firebase-admin');

// Supabaseクライアントの初期化
const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

// Firebase Admin SDKの初期化
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: 'luana-b337b',
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  });
}

exports.handler = async (event, context) => {
  // CORSヘッダーを設定
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  };

  // OPTIONSリクエストの処理
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: '',
    };
  }

  try {
    // POSTリクエストのみ処理
    if (event.httpMethod !== 'POST') {
      return {
        statusCode: 405,
        headers,
        body: JSON.stringify({ error: 'Method not allowed' }),
      };
    }

    const { userId, notification } = JSON.parse(event.body);

    if (!userId || !notification) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Missing required parameters' }),
      };
    }

    // 管理者のFCMトークンを取得
    const { data: tokens, error } = await supabase
      .from('fcm_tokens')
      .select('token')
      .eq('user_id', userId)
      .eq('is_admin', true);

    if (error) {
      console.error('トークン取得エラー:', error);
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: 'Failed to get FCM tokens' }),
      };
    }

    if (!tokens || tokens.length === 0) {
      return {
        statusCode: 404,
        headers,
        body: JSON.stringify({ error: 'No admin tokens found' }),
      };
    }

    // 各トークンに通知を送信
    const sendPromises = tokens.map(async ({ token }) => {
      try {
        const message = {
          notification: {
            title: notification.title,
            body: notification.body,
          },
          data: notification.data || {},
          token: token,
        };

        const response = await admin.messaging().send(message);
        console.log('通知送信成功:', response);
        return { success: true, token: token.substring(0, 10) + '...' };
      } catch (error) {
        console.error('通知送信エラー:', error);
        return { success: false, token: token.substring(0, 10) + '...', error: error.message };
      }
    });

    const results = await Promise.all(sendPromises);
    const successCount = results.filter(r => r.success).length;

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        message: `通知を${successCount}件送信しました`,
        results,
      }),
    };

  } catch (error) {
    console.error('関数実行エラー:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Internal server error' }),
    };
  }
}; 