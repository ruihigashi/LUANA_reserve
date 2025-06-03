import React from 'react'
import { Link } from 'react-router-dom'
import { CheckCircle, Calendar, Home } from 'lucide-react'
import Button from '../ui/Button'

const ConfirmReservation: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-50 flex items-center justify-center px-4 py-12 animate-fadeIn">
      <div className="bg-white shadow-xl rounded-2xl p-8 max-w-md w-full text-center space-y-8">
        {/* ✅ 成功マーク */}
        <div className="flex justify-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center shadow">
            <CheckCircle className="w-12 h-12 text-green-600 animate-bounce" />
          </div>
        </div>

        {/* ✅ メッセージ */}
        <div className="space-y-2">
          <h2 className="text-3xl font-bold text-blue-900">
            ご予約が完了しました！
          </h2>
          <p className="text-gray-700">
            ご予約ありがとうございます。<br />
            当日、心よりお待ちしております。
          </p>
          {/* 追加文言（"過ぎますと" で改行） */}
          <p className="text-sm text-red-600">
            ※当日はご予約時間から15分を過ぎますと<br />
            自動的にキャンセル扱いとなりますので、ご了承ください。
          </p>
        </div>

        {/* ✅ ボタン */}
        <div className="space-y-3">
          <Link to="/reservation">
            <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center mb-2">
              <Calendar className="w-5 h-5 mr-2" />
              別の予約をする
            </Button>
          </Link>
          <Link to="/">
            <Button
              variant="outline"
              className="w-full border-blue-600 text-blue-600 hover:bg-purple-50 flex items-center justify-center"
            >
              <Home className="w-5 h-5 mr-2" />
              ホームに戻る
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}

export default ConfirmReservation
