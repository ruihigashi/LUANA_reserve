import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { Calendar, Clock, User, Mail, Phone, CheckCircle, AlertCircle } from 'lucide-react';
import { useReservation } from '../../context/ReservationContext';
import { supabase } from '../../lib/supabase';
import Button from '../ui/Button';
import Card from '../ui/Card';

const ConfirmReservation: React.FC = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    selectedService,
    selectedDate,
    selectedTimeSlot,
    customerName,
    customerEmail,
    customerPhone,
    notes,
    resetReservation
  } = useReservation();

  const navigate = useNavigate();

  const handleBack = () => {
    navigate('/reservation/details');
  };

  const handleConfirm = async () => {
    if (!selectedService || !selectedDate || !selectedTimeSlot) {
      setError('予約情報が不足しています。もう一度お試しください。');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const formattedDate = format(selectedDate, 'yyyy-MM-dd');

      const { data, error } = await supabase
        .from('reservations')
        .insert([
          {
            service_id: selectedService.id,
            customer_name: customerName,
            customer_email: customerEmail,
            customer_phone: customerPhone,
            date: formattedDate,
            time_slot_id: selectedTimeSlot.id,
            notes: notes || null,
          }
        ])
        .select();

      if (error) throw error;

      navigate('/reservation/success', {
        state: { reservationId: data?.[0]?.id }
      });

      resetReservation();
    } catch (err) {
      console.error('予約作成エラー:', err);
      setError('予約の作成に失敗しました。もう一度お試しください。');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!selectedService || !selectedDate || !selectedTimeSlot) {
    navigate('/reservation/services');
    return null;
  }

  const formatTime = (timeString: string) => {
    try {
      const date = new Date(`2000-01-01T${timeString}`);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch (error) {
      return timeString;
    }
  };

  return (
    <div className="py-8 animate-fadeIn">
      <h2 className="text-2xl font-serif font-bold text-purple-900 mb-6 text-center">
        ご予約内容の確認
      </h2>

      <Card className="max-w-2xl mx-auto p-6 mb-8">
        <h3 className="font-serif text-xl font-bold text-purple-800 mb-6 pb-3 border-b border-pink-200">
          予約サマリー
        </h3>

        <div className="space-y-4">
          <div className="flex justify-between items-start">
            <span className="font-medium text-gray-700">サービス:</span>
            <div className="text-right">
              <div className="font-bold text-purple-900">{selectedService.name}</div>
              <div className="text-sm text-gray-600">
                {selectedService.duration} 分 - ¥{selectedService.price.toLocaleString()}
              </div>
            </div>
          </div>

          <div className="flex justify-between items-center">
            <span className="flex items-center font-medium text-gray-700">
              <Calendar className="w-4 h-4 mr-2" />
              日付:
            </span>
            <span className="font-bold text-purple-900">
              {format(selectedDate, 'yyyy年M月d日 (EEE)', { locale: undefined })}
            </span>
          </div>

          <div className="flex justify-between items-center">
            <span className="flex items-center font-medium text-gray-700">
              <Clock className="w-4 h-4 mr-2" />
              時間:
            </span>
            <span className="font-bold text-purple-900">
              {formatTime(selectedTimeSlot.start_time)}
            </span>
          </div>

          <div className="pt-4 border-t border-pink-100">
            <h4 className="font-medium text-purple-800 mb-3">お客様情報</h4>
            <div className="space-y-2">
              <div className="flex items-center">
                <User className="w-4 h-4 mr-2 text-gray-500" />
                <span>{customerName}</span>
              </div>
              <div className="flex items-center">
                <Mail className="w-4 h-4 mr-2 text-gray-500" />
                <span>{customerEmail}</span>
              </div>
              <div className="flex items-center">
                <Phone className="w-4 h-4 mr-2 text-gray-500" />
                <span>{customerPhone}</span>
              </div>
            </div>
          </div>

          {notes && (
            <div className="pt-4 border-t border-pink-100">
              <h4 className="font-medium text-purple-800 mb-2">ご要望・メモ</h4>
              <p className="text-gray-700">{notes}</p>
            </div>
          )}
        </div>
      </Card>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md flex items-center text-red-700">
          <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="flex flex-col sm:flex-row justify-between gap-4 max-w-2xl mx-auto">
        <Button type="button" variant="outline" onClick={handleBack} disabled={isSubmitting}>
          戻る
        </Button>
        <Button
          onClick={handleConfirm}
          disabled={isSubmitting}
          className="flex items-center justify-center"
        >
          {isSubmitting ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
              登録中...
            </>
          ) : (
            <>
              <CheckCircle className="w-5 h-5 mr-2" />
              予約を確定する
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default ConfirmReservation;
