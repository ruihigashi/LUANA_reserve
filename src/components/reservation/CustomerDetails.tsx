// src/components/reservation/CustomerDetails.tsx
import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import {
  Calendar,
  Clock,
  Tag,
  MessageSquare,
  CreditCard,
} from 'lucide-react';
import { useReservation } from '../../context/ReservationContext';
import Button from '../ui/Button';

const CustomerDetails: React.FC = () => {
  const {
    selectedServices,
    selectedDate,
    selectedTimeSlot,
    notes,
    setNotes,
  } = useReservation();
  const navigate = useNavigate();

  // もしサービスまたは日時が未選択ならサービス選択に戻す
  if (
    !selectedServices ||
    selectedServices.length === 0 ||
    !selectedDate ||
    !selectedTimeSlot
  ) {
    navigate('/reservation/services');
    return null;
  }

  // 日付＋時刻を「2025年06月08日（日）10:00～」形式にフォーマット
  const formattedDateTime = useMemo(() => {
    const datePart = format(selectedDate, 'yyyy年MM月dd日 (E)');
    const timePart = format(
      new Date(
        `${format(selectedDate, 'yyyy-MM-dd')}T${selectedTimeSlot.start_time}`
      ),
      'H:mm'
    );
    return `${datePart}  ${timePart}～`;
  }, [selectedDate, selectedTimeSlot]);

  // サービス名を「A、B、C」という文字列に結合
  const serviceNames = useMemo(() => {
    return selectedServices.map((svc) => svc.name).join('、');
  }, [selectedServices]);

  // 合計金額を計算
  const totalPrice = useMemo(() => {
    return selectedServices.reduce((sum, svc) => sum + svc.price, 0);
  }, [selectedServices]);

  // 「前に戻る」→日時選択画面へ
  const handleBack = () => {
    navigate('/reservation/datetime');
  };

  // フォーム送信 → 確認画面へ
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    navigate('/reservation/confirm');
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-8">
        {/* ────────────────
            ▼ ご予約内容カード
        ──────────────── */}
        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
          <div className="bg-gradient-to-r from-purple-600 to-purple-800 px-6 py-4 flex items-center">
            <Calendar className="w-5 h-5 text-white mr-2" />
            <h2 className="text-white text-lg font-semibold">
              ご予約内容
            </h2>
          </div>
          <div className="px-6 py-5 space-y-4">
            <div className="flex items-center space-x-3">
              <Clock className="w-5 h-5 text-purple-600" />
              <span className="text-gray-700 font-medium w-20">日時</span>
              <span className="text-gray-900">{formattedDateTime}</span>
            </div>
            <div className="flex items-center space-x-3">
              <Tag className="w-5 h-5 text-purple-600" />
              <span className="text-gray-700 font-medium w-20">メニュー</span>
              <span className="text-gray-900">{serviceNames}</span>
            </div>
          </div>
        </div>

        {/* ────────────────
            ▼ 質問・確認事項カード
        ──────────────── */}
        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
          <div className="bg-gradient-to-r from-purple-600 to-purple-800 px-6 py-4 flex items-center">
            <MessageSquare className="w-5 h-5 text-white mr-2" />
            <h2 className="text-white text-lg font-semibold">
              質問・確認事項
            </h2>
          </div>
          <div className="px-6 py-5">
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full h-32 px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none transition-colors duration-150"
              placeholder="こちらに質問やご要望をご記入ください（任意）"
            />
          </div>
        </div>

        {/* ────────────────
            ▼ お支払い情報カード
        ──────────────── */}
        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
          <div className="bg-gradient-to-r from-purple-600 to-purple-800 px-6 py-4 flex items-center">
            <CreditCard className="w-5 h-5 text-white mr-2" />
            <h2 className="text-white text-lg font-semibold">
              お支払い情報
            </h2>
          </div>
          <div className="px-6 py-5 flex justify-between items-center">
            <span className="text-gray-700 font-medium">合計（消費税込）</span>
            <span className="text-2xl font-bold text-purple-800">
              {totalPrice.toLocaleString()}円
            </span>
          </div>
        </div>

        {/* ────────────────
            ▼ アクションボタン
        ──────────────── */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleBack}
              className="w-full flex justify-center items-center border-purple-600 text-purple-600 hover:bg-purple-50"
            >
              &larr; 前に戻る
            </Button>
            <Button
              type="submit"
              className="w-full bg-green-600 hover:bg-green-700 text-white flex justify-center items-center"
            >
              この内容で予約する
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CustomerDetails;
