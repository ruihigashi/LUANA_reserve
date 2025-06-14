// src/components/reservation/CustomerDetails.tsx
// -------------------------------------------------
// 予約確定時にプッシュ通知を送るバージョン（Supabase v2 対応）
// -------------------------------------------------

import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { Calendar, Clock, Tag } from 'lucide-react';
import { useReservation } from '../../context/ReservationContext';
import Button from '../ui/Button';
import { supabase } from '../../lib/supabase';
import { registerPush } from '../../hooks/usePush';  // 相対パスで調整

const CustomerDetails: React.FC = () => {
  /* ① 画面表示時に一度だけプッシュ通知の許可を取り、
        FCM トークンを Supabase に保存 */
  useEffect(() => {
    registerPush().catch(console.error);
  }, []);

  const {
    selectedServices,
    selectedDate,
    selectedTimeSlot,
    notes,
    setNotes,
  } = useReservation();
  const navigate = useNavigate();

  /* ---------------- フォーム状態 ---------------- */
  const [lastName,      setLastName]      = useState('');
  const [firstName,     setFirstName]     = useState('');
  const [lastNameKana,  setLastNameKana]  = useState('');
  const [firstNameKana, setFirstNameKana] = useState('');
  const [phone,         setPhone]         = useState('');

  /* ---------------- バリデーション ---------------- */
  const isNameValid =
    lastName && firstName && lastNameKana && firstNameKana;
  const isPhoneValid = !!phone;
  const isFormValid =
    isNameValid && isPhoneValid && !!selectedDate && !!selectedTimeSlot;

  /* 必須データが欠けている場合は選択画面へ戻す */
  if (!selectedServices?.length || !selectedDate || !selectedTimeSlot) {
    navigate('/reservation/services');
    return null;
  }

  /* ---------------- 表示用の加工 ---------------- */
  const formattedDateTime = useMemo(() => {
    const datePart = format(selectedDate, 'yyyy年MM月dd日 (E)');
    const timePart = format(
      new Date(
        `${format(selectedDate, 'yyyy-MM-dd')}T${selectedTimeSlot.start_time}`
      ),
      'H:mm'
    );
    return `${datePart} ${timePart}～`;
  }, [selectedDate, selectedTimeSlot]);

  const serviceNames = useMemo(
    () => selectedServices.map((s) => s.name).join('、'),
    [selectedServices]
  );
  const totalPrice = useMemo(
    () => selectedServices.reduce((sum, s) => sum + s.price, 0),
    [selectedServices]
  );
  const totalRequiredMinutes = useMemo(
    () => selectedServices.reduce((sum, s) => sum + s.duration, 0),
    [selectedServices]
  );

  /* HH:mm:ss 形式で分加算 */
  const addMinutes = (time: string, mins: number) => {
    const [h, m, s] = time.split(':').map(Number);
    const d = new Date(0, 0, 0, h, m, s);
    d.setMinutes(d.getMinutes() + mins);
    return d.toTimeString().substring(0, 8);
  };

  const handleBack = () => navigate('/reservation/datetime');

  /* ---------------- 送信ハンドラ ---------------- */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) {
      alert('お名前（漢字・カナ）と電話番号は必須です。');
      return;
    }

    const dateStr = format(selectedDate, 'yyyy-MM-dd');
    const endTime = addMinutes(selectedTimeSlot.start_time, totalRequiredMinutes);

    try {
      /* 1) 顧客登録 */
      const { data: customer, error: errCust } = await supabase
        .from('customers')
        .insert({
          last_name:         lastName.trim(),
          first_name:        firstName.trim(),
          last_name_kana:    lastNameKana.trim(),
          first_name_kana:   firstNameKana.trim(),
          phone:             phone.trim(),
        })
        .select('id')
        .single();
      if (errCust) throw errCust;

      /* 2) 予約登録 */
      const { data: reservation, error: errRes } = await supabase
        .from('reservations')
        .insert({
          customer_id:  customer!.id,
          date:         dateStr,
          start_time:   selectedTimeSlot.start_time,
          end_time:     endTime,
          status:       'pending',
          service_names:serviceNames,
          total_price:  totalPrice,
          notes:        notes || '',
        })
        .select('id')
        .single();
      if (errRes) throw errRes;

      /* 3) 空き枠を埋める */
      await supabase
        .from('time_slots')
        .update({ is_available: false })
        .eq('date', dateStr)
        .gte('start_time', selectedTimeSlot.start_time)
        .lt('start_time',  endTime);

      /* 4) 通知送信 */
      const {
        data: { user },
        error: userErr,
      } = await supabase.auth.getUser();     // v2 の取得方法
      if (!user || userErr) {
        console.error('ユーザー取得エラー', userErr);
      } else {
        await fetch('/functions/sendNotification', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            user_id: user.id,
            title:   '予約が確定しました',
            body:    `${format(selectedDate,'MM月dd日')} ${format(new Date(`${dateStr}T${selectedTimeSlot.start_time}`),'H:mm')} の予約です`,
            url:     '/admin'   // 通知タップ時に開かせたい URL（任意）
          }),
        });
      }

      /* 5) 完了画面へ */
      navigate('/reservation/confirm', {
        state: { reservationId: reservation!.id },
      });
    } catch (err) {
      console.error('登録エラー:', err);
      alert('登録に失敗しました。再度お試しください。');
    }
  };

  /* ---------------- JSX ---------------- */
  return (
    <div className="min-h-screen bg-blue-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-8">

        {/* 予約内容 */}
        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-blue-800 px-6 py-4 flex items-center">
            <Calendar className="w-5 h-5 text-white mr-2" />
            <h2 className="text-white text-lg font-semibold">ご予約内容</h2>
          </div>
          <div className="px-6 py-5 space-y-4">
            <div className="flex items-center space-x-3">
              <Clock className="w-5 h-5 text-blue-900" />
              <span className="text-gray-700 font-medium w-20">日時</span>
              <span className="text-gray-900 text-sm">{formattedDateTime}</span>
            </div>
            <div className="flex items-center space-x-3">
              <Tag className="w-5 h-5 text-blue-900" />
              <span className="text-gray-700 font-medium w-20">メニュー</span>
              <span className="text-gray-900 text-sm">{serviceNames}</span>
            </div>
          </div>
        </div>

        {/* お客様情報入力 */}
        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-blue-800 px-6 py-4 flex items-center">
            <Tag className="w-5 h-5 text-white mr-2" />
            <h2 className="text-white text-lg font-semibold">お客様情報</h2>
          </div>
          <div className="px-6 py-5 space-y-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* 姓・名 */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-700 mb-1">姓</label>
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    required
                    placeholder="山田"
                    className={`w-full p-3 border rounded-md focus:outline-none ${lastName ? 'border-gray-300 focus:ring-2 focus:ring-blue-600' : 'border-red-500'}`}
                  />
                </div>
                <div>
                  <label className="block text-gray-700 mb-1">名</label>
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                    placeholder="太郎"
                    className={`w-full p-3 border rounded-md focus:outline-none ${firstName ? 'border-gray-300 focus:ring-2 focus:ring-blue-600' : 'border-red-500'}`}
                  />
                </div>
              </div>

              {/* カナ */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-700 mb-1">セイ</label>
                  <input
                    type="text"
                    value={lastNameKana}
                    onChange={(e) => setLastNameKana(e.target.value)}
                    required
                    placeholder="ヤマダ"
                    className={`w-full p-3 border rounded-md focus:outline-none ${lastNameKana ? 'border-gray-300 focus:ring-2 focus:ring-blue-600' : 'border-red-500'}`}
                  />
                </div>
                <div>
                  <label className="block text-gray-700 mb-1">メイ</label>
                  <input
                    type="text"
                    value={firstNameKana}
                    onChange={(e) => setFirstNameKana(e.target.value)}
                    required
                    placeholder="タロウ"
                    className={`w-full p-3 border rounded-md focus:outline-none ${firstNameKana ? 'border-gray-300 focus:ring-2 focus:ring-blue-600' : 'border-red-500'}`}
                  />
                </div>
              </div>

              {/* 電話番号 */}
              <div>
                <label className="block text-gray-700 mb-1">電話番号</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                  placeholder="09012345678"
                  className={`w-full p-3 border rounded-md focus:outline-none ${phone ? 'border-gray-300 focus:ring-2 focus:ring-blue-600' : 'border-red-500'}`}
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
                  placeholder="何かご要望があればご記入ください"
                  className="w-full h-24 p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600 resize-none"
                />
              </div>

              {/* ボタン */}
              <div className="pt-4 flex justify-between">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleBack}
                  className="flex items-center justify-center border-blue-600 text-blue-600 hover:bg-blue-50 w-1/2 text-sm mr-2"
                >
                  &larr; 3.日時へ戻る
                </Button>
                <Button
                  type="submit"
                  disabled={!isFormValid}
                  className={`flex items-center justify-center w-1/2 ${
                    isFormValid
                      ? 'bg-blue-600 hover:bg-blue-700 text-white'
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
