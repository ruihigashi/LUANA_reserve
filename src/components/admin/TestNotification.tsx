import React, { useState } from 'react';
import { notifyAdmin } from '../../hooks/usePush';
import Button from '../ui/Button';

const TestNotification: React.FC = () => {
  const [isSending, setIsSending] = useState(false);
  const [message, setMessage] = useState('');

  const handleTestNotification = async () => {
    setIsSending(true);
    setMessage('');

    try {
      await notifyAdmin(
        'テスト通知',
        'これはテスト通知です。管理者のスマートフォンに届くはずです。',
        {
          test: true,
          timestamp: new Date().toISOString()
        }
      );
      setMessage('テスト通知を送信しました！');
    } catch (error) {
      console.error('テスト通知エラー:', error);
      setMessage('テスト通知の送信に失敗しました');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">
        通知テスト
      </h2>
      
      <div className="space-y-4">
        <div className="text-sm text-gray-600">
          <p>このボタンを押すと管理者のスマートフォンにテスト通知が送信されます。</p>
          <p>管理者トークンが正しく登録されているか確認できます。</p>
        </div>

        <Button
          onClick={handleTestNotification}
          disabled={isSending}
          className={`w-full ${
            !isSending
              ? 'bg-green-600 hover:bg-green-700 text-white'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          {isSending ? '送信中...' : 'テスト通知を送信'}
        </Button>

        {message && (
          <div className={`p-3 rounded text-sm ${
            message.includes('成功') || message.includes('送信しました')
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

export default TestNotification; 