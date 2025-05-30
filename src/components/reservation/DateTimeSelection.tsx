import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { format, addDays, isSameDay, parseISO } from 'date-fns';
import { Calendar, Clock } from 'lucide-react';
import { useReservation } from '../../context/ReservationContext';
import { TimeSlot } from '../../types';
import { supabase } from '../../lib/supabase';
import Card from '../ui/Card';
import Button from '../ui/Button';

const DateTimeSelection: React.FC = () => {
    const [availableDates, setAvailableDates] = useState<Date[]>([]);
    const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const {
        selectedService,
        selectedDate,
        selectedTimeSlot,
        setSelectedDate,
        setSelectedTimeSlot
    } = useReservation();

    const navigate = useNavigate();

    useEffect(() => {
        const dates = [];
        const today = new Date();

        for (let i = 1; i <= 14; i++) {
            dates.push(addDays(today, i));
        }

        setAvailableDates(dates);
    }, []);

    useEffect(() => {
        if (!selectedDate) return;

        const fetchTimeSlots = async () => {
            setLoading(true);
            try {
                const formattedDate = format(selectedDate, 'yyyy-MM-dd');

                const { data, error } = await supabase
                    .from('time_slots')
                    .select('*')
                    .eq('is_available', true)
                    .order('start_time');
            

    if (error) throw error;
    setTimeSlots(data || []);
} catch (err) {
    setError('時間枠の読み込みに失敗しました。もう一度お試しください。');
    console.error('時間枠取得エラー:', err);
} finally {
    setLoading(false);
}
    };

fetchTimeSlots();
  }, [selectedDate]);

const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    setSelectedTimeSlot(null);
};

const handleTimeSelect = (timeSlot: TimeSlot) => {
    setSelectedTimeSlot(timeSlot);
};

const handleContinue = () => {
    if (selectedDate && selectedTimeSlot) {
        navigate('/reservation/details');
    }
};

const handleBack = () => {
    navigate('/reservation/services');
};

const formatTime = (timeString: string) => {
    try {
        const date = parseISO(`2000-01-01T${timeString}`);
        return format(date, 'H:mm');
    } catch (error) {
        return timeString;
    }
};

if (!selectedService) {
    navigate('/reservation/services');
    return null;
}

return (
    <div className="py-8 animate-fadeIn">
        <h2 className="text-2xl font-serif font-bold text-purple-900 mb-6 text-center">
            日時を選択してください
        </h2>

        <div className="mb-8">
            <h3 className="flex items-center text-lg font-medium text-purple-800 mb-4">
                <Calendar className="w-5 h-5 mr-2" />
                日付を選択
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-7 gap-2">
                {availableDates.map((date) => (
                    <button
                        key={date.toISOString()}
                        className={`
                p-3 rounded-md text-center transition-all duration-300
                ${selectedDate && isSameDay(date, selectedDate)
                                ? 'bg-purple-600 text-white shadow-md'
                                : 'bg-white hover:bg-pink-100 text-gray-700 hover:text-purple-800'
                            }
              `}
                        onClick={() => handleDateSelect(date)}
                    >
                        <div className="font-medium">{format(date, 'EEE', { locale: undefined })}</div>
                        <div className="text-lg font-bold">{format(date, 'd')}</div>
                        <div className="text-xs">{format(date, 'MMM')}</div>
                    </button>
                ))}
            </div>
        </div>

        {selectedDate && (
            <div className="mb-8">
                <h3 className="flex items-center text-lg font-medium text-purple-800 mb-4">
                    <Clock className="w-5 h-5 mr-2" />
                    時間を選択
                </h3>

                {loading ? (
                    <div className="flex justify-center py-4">
                        <div className="animate-pulse h-8 w-32 bg-gray-300 rounded"></div>
                    </div>
                ) : error ? (
                    <p className="text-center text-red-600">{error}</p>
                ) : timeSlots.length === 0 ? (
                    <p className="text-center text-gray-600">この日の利用可能な時間枠はありません。</p>
                ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                        {timeSlots.map((slot) => (
                            <button
                                key={slot.id}
                                className={`
                    p-3 rounded-md text-center transition-all duration-300
                    ${selectedTimeSlot?.id === slot.id
                                        ? 'bg-purple-600 text-white shadow-md'
                                        : 'bg-white hover:bg-pink-100 text-gray-700 hover:text-purple-800'
                                    }
                  `}
                                onClick={() => handleTimeSelect(slot)}
                            >
                                {formatTime(slot.start_time)}
                            </button>
                        ))}
                    </div>
                )}
            </div>
        )}

        <div className="flex flex-col sm:flex-row justify-between gap-4">
            <Button variant="outline" onClick={handleBack}>
                戻る
            </Button>
            <Button
                onClick={handleContinue}
                disabled={!selectedDate || !selectedTimeSlot}
            >
                次へ
            </Button>
        </div>
    </div>
);
};

export default DateTimeSelection;