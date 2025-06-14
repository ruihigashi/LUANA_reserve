// src/components/reservation/CustomerDetails.tsx

import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { Calendar, Clock, Tag } from 'lucide-react';
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

  // フォーム入力状態
  const [lastName, setLastName] = useState<string>('');
  const [firstName, setFirstName] = useState<string>('');
  const [lastNameKana, setLastNameKana] = useState<string>('');
  const [firstNameKana, setFirstNameKana] = useState<string>('');
  const [phone, setPhone] = useState<string>('');

  // バリデーション
  const isNameValid =
    lastName.trim() !== '' &&
    firstName.trim() !== '' &&
    lastNameKana.trim() !== '' &&
    firstNameKana.trim() !== '';
  const isPhoneValid = phone.trim() !== '';
  const isFormValid =
    isNameValid && isPhoneValid && !!selectedDate && !!selectedTimeSlot;

  // サービス未選択や日時未選択なら戻す
  if (
    !selectedServices ||
    selectedServices.length === 0 ||
    !selectedDate ||
    !selectedTimeSlot
  ) {
    navigate('/reservation/services');
    return null;
  }

  // 日時表示用フォーマット
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

  // サービス名の結合・合計金額・合計時間
  const serviceNames = useMemo(
    () => selectedServices.map((svc) => svc.name).join('、'),
    [selectedServices]
  );
  const totalPrice = useMemo(
    () => selectedServices.reduce((sum, svc) => sum + svc.price, 0),
    [selectedServices]
  );
  const totalRequiredMinutes = useMemo(
    () => selectedServices.reduce((sum, svc) => sum + svc.duration, 0),
    [selectedServices]
  );

  // 時間加算ユーティリティ
  function incrementTimeByMinutes(baseTime: string, addMin: number): string {
    const [h, m, s] = baseTime.split(':').map(Number);
    const dateObj = new Date(0, 0, 0, h, m, s);
    dateObj.setMinutes(dateObj.getMinutes() + addMin);
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${pad(dateObj.getHours())}:${pad(
      dateObj.getMinutes()
    )}:${pad(dateObj.getSeconds())}`;
  }

  const handleBack = () => {
    navigate('/reservation/datetime');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) {
      alert('お名前（漢字・カナ）と電話番号は必須です。');
      return;
    }

    const dateStr = format(selectedDate, 'yyyy-MM-dd');
    const endTimeString = incrementTimeByMinutes(
      selectedTimeSlot.start_time,
      totalRequiredMinutes
    );

    try {
      // 1) 顧客登録
      const { data: customerData, error: customerError } = await supabase
        .from('customers')
        .insert({
          last_name: lastName.trim(),
          first_name: firstName.trim(),
          last_name_kana: lastNameKana.trim(),
          first_name_kana: firstNameKana.trim(),
          phone: phone.trim(),
        })
        .select('id')
        .single();
      if (customerError) throw customerError;
      const newCustomerId = customerData!.id;

      // 2) 予約登録
      const { data: reservationData, error: reservationError } =
        await supabase
          .from('reservations')
          .insert({
            customer_id: newCustomerId,
            date: dateStr,
            start_time: selectedTimeSlot.start_time,
            end_time: endTimeString,
            status: 'pending',
            service_names: serviceNames,
            total_price: totalPrice,
            notes: notes || '',
          })
          .select('id')
          .single();
      if (reservationError) throw reservationError;
      const newReservationId = reservationData!.id;

      // 3) Edge Function で管理者へ通知
      const { error: fnError } = await supabase.functions.invoke('sendPush', {
        body: {
          customerName: `${lastName} ${firstName}`,
          reservationTime: `${dateStr} ${selectedTimeSlot.start_time}`,
        },
      });
      if (fnError) console.error('通知エラー:', fnError);

      // 4) 空き時間更新
      const { error: updateSlotsError } = await supabase
        .from('time_slots')
        .update({ is_available: false })
        .eq('date', dateStr)
        .gte('start_time', selectedTimeSlot.start_time)
        .lt('start_time', endTimeString);
      if (updateSlotsError) {
        console.error('time_slots 更新エラー:', updateSlotsError);
      }

      // 5) 完了ページへ遷移
      navigate('/reservation/confirm', {
        state: { reservationId: newReservationId },
      });
    } catch (err: any) {
      console.error('顧客／予約作成エラー:', err);
      alert('登録に失敗しました。再度お試しください。');
    }
  };

  return (
    <div className="min-h-screen bg-blue-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-8">
        {/* 予約内容カード */}
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

        {/* お客様情報入力欄 */}
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
                    className={`w-full p-3 border rounded-md focus:outline-none ${
                      lastName.trim() === ''
                        ? 'border-red-500'
                        : 'border-gray-300 focus:ring-2 focus:ring-blue-600'
                    }`}
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
                    className={`w-full p-3 border rounded-md focus:outline-none ${
                      firstName.trim() === ''
                        ? 'border-red-500'
                        : 'border-gray-300 focus:ring-2 focus:ring-blue-600'
                    }`}
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
                    className={`w-full p-3 border rounded-md focus:outline-none ${
                      lastNameKana.trim() === ''
                        ? 'border-red-500'
                        : 'border-gray-300 focus:ring-2 focus:ring-blue-600'
                    }`}
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
                    className={`w-full p-3 border rounded-md focus:outline-none ${
                      firstNameKana.trim() === ''
                        ? 'border-red-500'
                        : 'border-gray-300 focus:ring-2 focus:ring-blue-600'
                    }`}
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
                    className={`w-full p-3 border rounded-md focus:outline-none ${
                      phone.trim() === ''
                        ? 'border-red-500'
                        : 'border-gray-300 focus:ring-2 focus:ring-blue-600'
                    }`}
                  />
              </div>

              {/* 質問・確認事項 */}
              <div>
                <label className="block text-gray-700 mb-1">質問・確認事項（任意）</label>
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
