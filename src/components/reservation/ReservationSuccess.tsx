import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { CheckCircle, Calendar, ArrowRight } from 'lucide-react';
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

const ReservationSuccess: React.FC = () => {
  const [reservation, setReservation] = useState<ReservationDetail | null>(null);
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as LocationState;

  useEffect(() => {
    if (!state?.reservationId) {
      navigate('/');
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
    } catch (error) {
      return dateStr;
    }
  };

  const formatTime = (timeStr: string) => {
    try {
      const date = new Date(`2000-01-01T${timeStr}`);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch (error) {
      return timeStr;
    }
  };

  return (
    <div className="py-12 animate-fadeIn">
      <div className="max-w-lg mx-auto bg-white rounded-lg shadow-md p-8 text-center">
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
        </div>

        <h2 className="text-2xl font-serif font-bold text-purple-900 mb-4">
          ご予約が完了しました！
        </h2>

        <p className="text-gray-600 mb-8">
          ご予約ありがとうございます。ご来店を心よりお待ちしております。
        </p>

        {reservation && (
          <div className="bg-purple-50 rounded-md p-4 mb-8">
            <h3 className="font-medium text-purple-800 mb-3">予約内容の確認</h3>

            <div className="space-y-2 text-left">
              <div className="flex justify-between">
                <span className="text-gray-600">サービス:</span>
                <span className="font-medium">{reservation.service_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">日付:</span>
                <span className="font-medium">{formatDate(reservation.date)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">時間:</span>
                <span className="font-medium">{formatTime(reservation.start_time)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">予約番号:</span>
                <span className="font-medium">{reservation.id}</span>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-4">
          <Link to="/reservation">
            <Button className="flex items-center justify-center w-full">
              <Calendar className="w-5 h-5 mr-2" />
              別の予約をする
            </Button>
          </Link>

          <Link to="/">
            <Button variant="outline" className="w-full">
              ホームに戻る
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ReservationSuccess;
