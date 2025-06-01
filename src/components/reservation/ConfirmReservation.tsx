import React from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle, Calendar, Home } from 'lucide-react';
import Button from '../ui/Button';

const ConfirmReservation: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-purple-100 flex items-center justify-center px-4 py-12 animate-fadeIn">
      <div className="bg-white shadow-xl rounded-2xl p-8 max-w-md w-full text-center space-y-8">
        {/* ✅ 成功マーク */}
        <div className="flex justify-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center shadow">
            <CheckCircle className="w-12 h-12 text-green-600 animate-bounce" />
          </div>
        </div>

        {/* ✅ メッセージ */}
        <div>
          <h2 className="text-3xl font-bold text-purple-900 mb-2">
            ご予約が完了しました！
          </h2>
          <p className="text-gray-700">
            ご予約ありがとうございます。<br />当日、心よりお待ちしております。
          </p>
        </div>

        {/* ✅ ボタン */}
        <div className="space-y-3">
          <Link to="/reservation">
            <Button className="w-full bg-green-600 hover:bg-green-700 text-white flex items-center justify-center">
              <Calendar className="w-5 h-5 mr-2" />
              別の予約をする
            </Button>
          </Link>
          <Link to="/">
            <Button variant="outline" className="w-full border-purple-600 text-purple-600 hover:bg-purple-50 flex items-center justify-center">
              <Home className="w-5 h-5 mr-2" />
              ホームに戻る
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ConfirmReservation;
