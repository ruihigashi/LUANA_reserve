const { createClient } = require('@supabase/supabase-js');
const admin = require('firebase-admin');
const path = require('path');

// デバッグログ
console.log('環境変数チェック:');
console.log('VITE_SUPABASE_URL:', process.env.VITE_SUPABASE_URL ? '設定済み' : '未設定');
console.log('VITE_SUPABASE_ANON_KEY:', process.env.VITE_SUPABASE_ANON_KEY ? '設定済み' : '未設定');
console.log('FIREBASE_CLIENT_EMAIL:', process.env.FIREBASE_CLIENT_EMAIL ? '設定済み' : '未設定');
console.log('FIREBASE_PRIVATE_KEY:', process.env.FIREBASE_PRIVATE_KEY ? '設定済み' : '未設定');

// Supabaseクライアントの初期化
const supabase = createClient(
  process.env.VITE_SUPABASE_URL || 'https://opnrnjipuwjcxtvdnkdp.supabase.co',
  process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9wbnJuamlwdXdqY3h0dmRua2RwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc5MzA5ODcsImV4cCI6MjA2MzUwNjk4N30.tOn6MgfxpfA3S14vdCaADmbBnoJ1rjUwNo-Z4ZYOX48'
);

// Firebase Admin SDKの初期化
if (!admin.apps.length) {
  try {
    // サービスアカウントキーファイルのパス
    const serviceAccountPath = path.join(__dirname, '../../supabase/functions/sendNotification/serviceAccountKey.json');
    console.log('サービスアカウントキーパス:', serviceAccountPath);
    
    const serviceAccount = require(serviceAccountPath);
    
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
    
    console.log('Firebase Admin SDK初期化成功');
  } catch (error) {
    console.error('Firebase Admin SDK初期化エラー:', error);
    throw error;
  }
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
    console.log('通知送信リクエスト受信:', event.body);
    
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

    console.log('通知データ:', { userId, notification });

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

    console.log('取得されたトークン数:', tokens ? tokens.length : 0);

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
        console.log('トークンに通知送信中:', token.substring(0, 20) + '...');
        
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

    console.log('通知送信結果:', { successCount, totalCount: tokens.length, results });

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