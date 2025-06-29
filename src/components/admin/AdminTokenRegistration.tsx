import React, { useEffect, useState } from 'react';
import { registerAdminToken, getFCMToken } from '../../hooks/usePush';
import Button from '../ui/Button';

const AdminTokenRegistration: React.FC = () => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [message, setMessage] = useState('');
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    // ページ読み込み時にFCMトークンを取得
    const getToken = async () => {
      try {
        const fcmToken = await getFCMToken();
        setToken(fcmToken);
      } catch (error) {
        console.error('FCMトークン取得エラー:', error);
        setMessage('FCMトークンの取得に失敗しました');
      }
    };

    getToken();
  }, []);

  const handleRegisterToken = async () => {
    if (!token) {
      setMessage('FCMトークンが取得できていません');
      return;
    }

    setIsRegistering(true);
    setMessage('');

    try {
      // 通知許可をリクエスト
      if (Notification.permission !== 'granted') {
        const permission = await Notification.requestPermission();
        if (permission !== 'granted') {
          setMessage('通知許可が必要です');
          setIsRegistering(false);
          return;
        }
      }

      // 管理者トークンを登録
      await registerAdminToken(token);
      setMessage('管理者トークンが正常に登録されました！');
    } catch (error) {
      console.error('トークン登録エラー:', error);
      setMessage('トークン登録に失敗しました');
    } finally {
      setIsRegistering(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">
        管理者通知設定
      </h2>
      
      <div className="space-y-4">
        <div className="text-sm text-gray-600">
          <p>このページで管理者のプッシュ通知を有効にしてください。</p>
          <p>予約が確定されると、このデバイスに通知が届きます。</p>
        </div>

        {token && (
          <div className="p-3 bg-green-50 border border-green-200 rounded">
            <p className="text-sm text-green-800">
              ✓ FCMトークンが取得できました
            </p>
            <p className="text-xs text-green-600 mt-1">
              {token.substring(0, 20)}...
            </p>
          </div>
        )}

        {!token && (
          <div className="p-3 bg-yellow-50 border border-yellow-200 rounded">
            <p className="text-sm text-yellow-800">
              FCMトークンの取得中...
            </p>
          </div>
        )}

        <Button
          onClick={handleRegisterToken}
          disabled={!token || isRegistering}
          className={`w-full ${
            token && !isRegistering
              ? 'bg-blue-600 hover:bg-blue-700 text-white'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          {isRegistering ? '登録中...' : '管理者通知を有効にする'}
        </Button>

        {message && (
          <div className={`p-3 rounded text-sm ${
            message.includes('成功') || message.includes('正常')
              ? 'bg-green-50 text-green-800 border border-green-200'
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}>
            {message}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminTokenRegistration; 