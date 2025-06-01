// src/components/reservation/ConfirmReservation.tsx
import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { CheckCircle, Calendar, Home, Tag, Clock, Hash } from 'lucide-react';
import Button from '../ui/Button';
import { supabase } from '../../lib/supabase';

interface LocationState {
  reservationId?: number;
}

interface ReservationDetail {
  id: number;
  service_name: string;
  date: string;
  start_time: string;
}

const ConfirmReservation: React.FC = () => {
  const [reservation, setReservation] = useState<ReservationDetail | null>(null);
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as LocationState;

  useEffect(() => {
    // 確認画面としてではなく、完了画面を担うので reservationId がなければ戻す
    if (!state?.reservationId) {
      navigate('/reservation');
      return;
    }

    const fetchReservationDetails = async () => {
      try {
        const { data, error } = await supabase
          .from('reservations')
          .select(`
            id,
            date,
            services(name),
            time_slots(start_time)
          `)
          .eq('id', state.reservationId)
          .single();

        if (error) throw error;

        if (data) {
          setReservation({
            id: data.id,
            service_name: data.services[0]?.name,
            date: data.date,
            start_time: data.time_slots[0]?.start_time,
          });
        }
      } catch (err) {
        console.error('予約情報の取得エラー:', err);
      }
    };

    fetchReservationDetails();
  }, [state, navigate]);

  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return new Intl.DateTimeFormat('ja-JP', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        weekday: 'long',
      }).format(date);
    } catch {
      return dateStr;
    }
  };

  const formatTime = (timeStr: string) => {
    try {
      const date = new Date(`2000-01-01T${timeStr}`);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return timeStr;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 animate-fadeIn">
      <div className="max-w-md w-full space-y-8">
        {/* Success Icon */}
        <div className="flex justify-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center shadow-lg">
            <CheckCircle className="w-12 h-12 text-green-600 animate-bounce" />
          </div>
        </div>

        {/* Heading */}
        <div className="text-center">
          <h2 className="mt-2 text-3xl leading-9 font-extrabold text-purple-900">
            ご予約が完了しました！
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            ご予約ありがとうございます。以下の内容で承りました。
          </p>
        </div>

        {/* Reservation Details Card */}
        {reservation && (
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="bg-gradient-to-r from-purple-600 to-purple-800 px-6 py-4 flex items-center">
              <Clock className="w-5 h-5 text-white mr-2" />
              <h3 className="text-white text-lg font-semibold">
                予約内容のご確認
              </h3>
            </div>
            <div className="px-6 py-5 space-y-4">
              <div className="flex items-center">
                <Tag className="w-5 h-5 text-purple-600 mr-2" />
                <span className="text-gray-700 font-medium w-20">サービス</span>
                <span className="text-gray-900">{reservation.service_name}</span>
              </div>
              <div className="flex items-center">
                <Calendar className="w-5 h-5 text-purple-600 mr-2" />
                <span className="text-gray-700 font-medium w-20">日付</span>
                <span className="text-gray-900">{formatDate(reservation.date)}</span>
              </div>
              <div className="flex items-center">
                <Clock className="w-5 h-5 text-purple-600 mr-2" />
                <span className="text-gray-700 font-medium w-20">時間</span>
                <span className="text-gray-900">{formatTime(reservation.start_time)}</span>
              </div>
              <div className="flex items-center">
                <Hash className="w-5 h-5 text-purple-600 mr-2" />
                <span className="text-gray-700 font-medium w-20">予約番号</span>
                <span className="text-gray-900">#{reservation.id}</span>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-4">
          <Link to="/reservation">
            <Button className="w-full flex items-center justify-center bg-green-600 hover:bg-green-700 text-white">
              <Calendar className="w-5 h-5 mr-2" />
              別の予約をする
            </Button>
          </Link>
          <Link to="/">
            <Button variant="outline" className="w-full flex items-center justify-center border-purple-600 text-purple-600 hover:bg-purple-50">
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
