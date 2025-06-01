// src/components/reservation/CustomerDetails.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import {
  Calendar,
  Clock,
  Tag,
  MessageSquare,
} from 'lucide-react';
import { useReservation } from '../../context/ReservationContext';
import Button from '../ui/Button';
import { supabase } from '../../lib/supabase';

const CustomerDetails: React.FC = () => {
  const {
    selectedServices,
    selectedDate,
    selectedTimeSlot,
    notes,
    setNotes,
  } = useReservation();
  const navigate = useNavigate();

  // 「姓」「名」「セイ」「メイ」「電話番号」のローカルステート
  const [lastName, setLastName] = useState<string>('');
  const [firstName, setFirstName] = useState<string>('');
  const [lastNameKana, setLastNameKana] = useState<string>('');
  const [firstNameKana, setFirstNameKana] = useState<string>('');
  const [phone, setPhone] = useState<string>('');

  // フィールドが空かどうかの判定
  const isNameValid =
    lastName.trim() !== '' &&
    firstName.trim() !== '' &&
    lastNameKana.trim() !== '' &&
    firstNameKana.trim() !== '';
  const isPhoneValid = phone.trim() !== '';

  // バリデーションOKなら「予約する」ボタンを有効化
  const isFormValid =
    isNameValid &&
    isPhoneValid &&
    !!selectedDate &&
    !!selectedTimeSlot;

  // 「サービスまたは日時が未選択」時はサービス選択に戻す
  if (
    !selectedServices ||
    selectedServices.length === 0 ||
    !selectedDate ||
    !selectedTimeSlot
  ) {
    navigate('/reservation/services');
    return null;
  }

  // フォーマット済みの日時表示（例：2025年06月08日 (日) 10:00～）
  const formattedDateTime = React.useMemo(() => {
    const datePart = format(selectedDate, 'yyyy年MM月dd日 (E)');
    const timePart = format(
      new Date(
        `${format(selectedDate, 'yyyy-MM-dd')}T${selectedTimeSlot.start_time}`
      ),
      'H:mm'
    );
    return `${datePart}  ${timePart}～`;
  }, [selectedDate, selectedTimeSlot]);

  // サービス名リストを「A、B、C…」の形で結合
  const serviceNames = React.useMemo(() => {
    return selectedServices.map((svc) => svc.name).join('、');
  }, [selectedServices]);

  // 合計金額を計算（INSERT には使うが、フロントでは表示しない）
  const totalPrice = React.useMemo(() => {
    return selectedServices.reduce((sum, svc) => sum + svc.price, 0);
  }, [selectedServices]);

  // 「前に戻る」 → 日時選択へ
  const handleBack = () => {
    navigate('/reservation/datetime');
  };

  // フォーム送信時の処理：reservations テーブルに一括 INSERT
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isFormValid) {
      alert('お名前（漢字・カナ）と電話番号は必須です。');
      return;
    }

    // Supabase に渡す日付文字列
    const dateStr = format(selectedDate, 'yyyy-MM-dd');

    try {
      // 1) reservations テーブルに一括 INSERT
      //    ※SQL で作成したカラムをすべてここにマッピングする
      const { data: reservationData, error: reservationError } =
        await supabase
          .from('reservations')
          .insert({
            customer_last_name: lastName,
            customer_first_name: firstName,
            customer_last_name_kana: lastNameKana,
            customer_first_name_kana: firstNameKana,
            customer_phone: phone,
            date: dateStr,
            time_slot_id: selectedTimeSlot.id,
            service_names: serviceNames,
            total_price: totalPrice,   // フロントには表示しないが、DBには保存
            notes: notes || '',
          })
          .select('id')
          .single();

      if (reservationError) {
        throw reservationError;
      }

      const newReservationId = reservationData?.id;
      if (!newReservationId) {
        throw new Error('予約IDが取得できませんでした');
      }

      // 2) 成功後は予約完了画面へ遷移し、reservationId を渡す
      navigate('/reservation/confirm', {
        state: { reservationId: newReservationId },
      });
    } catch (err: any) {
      console.error('予約作成エラー:', err);
      alert('予約の登録に失敗しました。再度お試しください。');
    }
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
            <h2 className="text-white text-lg font-semibold">ご予約内容</h2>
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
            ▼ お客様情報入力欄（紫背景カードで統一）
        ──────────────── */}
        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
          <div className="bg-gradient-to-r from-purple-600 to-purple-800 px-6 py-4 flex items-center">
            <Tag className="w-5 h-5 text-white mr-2" />
            <h2 className="text-white text-lg font-semibold">お客様情報</h2>
          </div>
          <div className="px-6 py-5 space-y-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* 漢字：姓・名 */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-700 mb-1">
                    姓 <span className="text-red-500">必須</span>
                  </label>
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    required
                    className={`w-full p-3 border rounded-md focus:outline-none ${
                      lastName.trim() === ''
                        ? 'border-red-500'
                        : 'border-gray-300 focus:ring-2 focus:ring-purple-500'
                    }`}
                    placeholder="山田"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 mb-1">
                    名 <span className="text-red-500">必須</span>
                  </label>
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                    className={`w-full p-3 border rounded-md focus:outline-none ${
                      firstName.trim() === ''
                        ? 'border-red-500'
                        : 'border-gray-300 focus:ring-2 focus:ring-purple-500'
                    }`}
                    placeholder="太郎"
                  />
                </div>
              </div>

              {/* カナ：セイ・メイ */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-700 mb-1">
                    セイ <span className="text-red-500">必須</span>
                  </label>
                  <input
                    type="text"
                    value={lastNameKana}
                    onChange={(e) => setLastNameKana(e.target.value)}
                    required
                    className={`w-full p-3 border rounded-md focus:outline-none ${
                      lastNameKana.trim() === ''
                        ? 'border-red-500'
                        : 'border-gray-300 focus:ring-2 focus:ring-purple-500'
                    }`}
                    placeholder="ヤマダ"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 mb-1">
                    メイ <span className="text-red-500">必須</span>
                  </label>
                  <input
                    type="text"
                    value={firstNameKana}
                    onChange={(e) => setFirstNameKana(e.target.value)}
                    required
                    className={`w-full p-3 border rounded-md focus:outline-none ${
                      firstNameKana.trim() === ''
                        ? 'border-red-500'
                        : 'border-gray-300 focus:ring-2 focus:ring-purple-500'
                    }`}
                    placeholder="タロウ"
                  />
                </div>
              </div>

              {/* 電話番号 */}
              <div>
                <label className="block text-gray-700 mb-1">
                  電話番号 <span className="text-red-500">必須</span>
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                  className={`w-full p-3 border rounded-md focus:outline-none ${
                    phone.trim() === ''
                      ? 'border-red-500'
                      : 'border-gray-300 focus:ring-2 focus:ring-purple-500'
                  }`}
                  placeholder="09012345678"
                />
              </div>

              {/* 質問・確認事項 */}
              <div>
                <label className="block text-gray-700 mb-1">
                  質問・確認事項（任意）
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full h-24 p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none transition-colors duration-150"
                  placeholder="こちらに質問やご要望をご記入ください"
                />
              </div>

              {/* 予約送信ボタン */}
              <div className="pt-4 flex justify-between">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleBack}
                  className="flex items-center justify-center border-purple-600 text-purple-600 hover:bg-purple-50 w-1/2"
                >
                  &larr; 3.日時へ戻る
                </Button>
                <Button
                  type="submit"
                  disabled={!isFormValid}
                  className={`flex items-center justify-center w-1/2 ${
                    isFormValid
                      ? 'bg-green-600 hover:bg-green-700 text-white'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  予約送信
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerDetails;
