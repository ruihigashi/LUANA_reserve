// src/components/reservation/DateTimeSelection.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  format,
  addDays,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameDay,
  isBefore,
  startOfDay,
} from 'date-fns';
import { useReservation } from '../../context/ReservationContext';
import { TimeSlot } from '../../types';
import { supabase } from '../../lib/supabase';
import Button from '../ui/Button';

interface DayAvailability {
  date: Date;
  hasAvailable: boolean; // 今日以降かつ空きスロットが１つでもある日 → true。それ以外は false。
}

interface WeeklySlot {
  date: Date;
  slots: TimeSlot[];
}

const DateTimeSelection: React.FC = () => {
  const {
    selectedServices,
    selectedDate,
    setSelectedDate,
    selectedTimeSlot,
    setSelectedTimeSlot,
  } = useReservation();
  const navigate = useNavigate();

  // 今日の日付（時刻部分を切り捨て）
  const [todayStart] = useState<Date>(startOfDay(new Date()));

  // カレンダー表示用の状態
  const [displayedMonth, setDisplayedMonth] = useState<Date>(new Date());
  const [monthDays, setMonthDays] = useState<DayAvailability[]>([]);
  const [isLoadingMonth, setIsLoadingMonth] = useState<boolean>(false);
  const [monthError, setMonthError] = useState<string | null>(null);

  // 週間グリッド用の状態
  const [weeklySlots, setWeeklySlots] = useState<WeeklySlot[]>([]);
  const [isLoadingWeek, setIsLoadingWeek] = useState<boolean>(false);
  const [weekError, setWeekError] = useState<string | null>(null);

  // ──────────────────────────────
  // 1) 月カレンダー用データを取得
  //    displayedMonth の 1日 ～ 末日をループし、
  //    ・今日より前 → hasAvailable = false
  //    ・今日以降で time_slots に is_available=true があれば true、なければ false
  // ──────────────────────────────
  useEffect(() => {
    const fetchMonthAvailability = async () => {
      setIsLoadingMonth(true);
      setMonthError(null);

      try {
        const firstOfMonth = startOfMonth(displayedMonth);
        const lastOfMonth = endOfMonth(displayedMonth);
        const firstStr = format(firstOfMonth, 'yyyy-MM-dd');
        const lastStr = format(lastOfMonth, 'yyyy-MM-dd');

        // → 取得範囲をログに出しておく
        console.log(`[DateTimeSelection] fetching time_slots for month:`, {
          firstOfMonth: firstStr,
          lastOfMonth: lastStr,
        });

        // Supabase から date・is_available を取得
        const { data, error } = await supabase
          .from('time_slots')
          .select('date, is_available')
          .gte('date', firstStr)
          .lte('date', lastStr);

        if (error) throw error;

        console.log('[DateTimeSelection] raw time_slots data:', data);

        // 日付 (YYYY-MM-DD) ごとに「空きフラグ」を集計
        const availabilityMap: Record<string, boolean> = {};
        data?.forEach((slot: { date: string; is_available: boolean }) => {
          // slot.date は "YYYY-MM-DD" 形式の文字列になっている想定
          if (slot.is_available) {
            availabilityMap[slot.date] = true;
          }
        });
        console.log('[DateTimeSelection] availabilityMap:', availabilityMap);

        // 当月 1日～末日 を列挙
        const daysArray = eachDayOfInterval({ start: firstOfMonth, end: lastOfMonth });

        // map → DayAvailability 配列に変換
        const daysWithAvailability: DayAvailability[] = daysArray.map((d) => {
          const key = format(d, 'yyyy-MM-dd');
          // ① 今日より前なら常に ×
          if (isBefore(d, todayStart)) {
            return { date: d, hasAvailable: false };
          }
          // ② 今日以降で availabilityMap[key]===true なら ○、それ以外は ×
          return {
            date: d,
            hasAvailable: availabilityMap[key] === true,
          };
        });

        setMonthDays(daysWithAvailability);
      } catch (e) {
        console.error('[DateTimeSelection] 月カレンダー取得エラー:', e);
        setMonthError('カレンダーの読み込みに失敗しました。');
      } finally {
        setIsLoadingMonth(false);
      }
    };

    fetchMonthAvailability();
  }, [displayedMonth, todayStart]);

  // ──────────────────────────────
  // 2) 選択日から 7 日間分のスロットを取得して weeklySlots に格納
  // ──────────────────────────────
  useEffect(() => {
    if (!selectedDate) {
      setWeeklySlots([]);
      return;
    }

    const fetchWeeklySlots = async () => {
      setIsLoadingWeek(true);
      setWeekError(null);

      try {
        // 選択日から 7 日分を配列で作成
        const weekDates = Array.from({ length: 7 }, (_, i) => addDays(selectedDate, i));
        const dateStrings = weekDates.map((d) => format(d, 'yyyy-MM-dd'));

        console.log('[DateTimeSelection] fetching weekly slots for dates:', dateStrings);

        // Supabase から date・start_time・is_available を取得
        const { data, error } = await supabase
          .from('time_slots')
          .select('id, date, start_time, is_available')
          .in('date', dateStrings)
          .order('start_time', { ascending: true });

        if (error) throw error;

        console.log('[DateTimeSelection] raw weekly slots data:', data);

        // 日付ごとにグループ化
        const grouped: Record<string, TimeSlot[]> = {};
        data?.forEach((slot: TimeSlot) => {
          if (!grouped[slot.date]) {
            grouped[slot.date] = [];
          }
          grouped[slot.date].push(slot);
        });

        // 配列を WeeklySlot[] の形に整形
        const weekSlotsArray: WeeklySlot[] = weekDates.map((d) => {
          const key = format(d, 'yyyy-MM-dd');
          return {
            date: d,
            slots: grouped[key] ?? [],
          };
        });

        setWeeklySlots(weekSlotsArray);
      } catch (e) {
        console.error('[DateTimeSelection] 週間スロット取得エラー:', e);
        setWeekError('空き時間の取得に失敗しました。');
      } finally {
        setIsLoadingWeek(false);
      }
    };

    fetchWeeklySlots();
  }, [selectedDate]);

  // ──────────────────────────────
  // 月の切り替えロジック
  // ──────────────────────────────
  const goToPreviousMonth = () => {
    setDisplayedMonth((prev) => {
      const firstOfPrevMonth = addDays(startOfMonth(prev), -1);
      return startOfMonth(firstOfPrevMonth);
    });
  };
  const goToNextMonth = () => {
    const firstOfNextMonth = addDays(endOfMonth(displayedMonth), 1);
    setDisplayedMonth(startOfMonth(firstOfNextMonth));
  };

  // ──────────────────────────────
  // 月カレンダーの日付セルクリック
  // － hasAvailable===false の日は無視
  // ──────────────────────────────
  const onClickMonthDay = (day: DayAvailability) => {
    if (!day.hasAvailable) return;
    setSelectedDate(day.date);
    setSelectedTimeSlot(null);
  };

  // ──────────────────────────────
  // 週間グリッドの時間帯セルクリック
  // ──────────────────────────────
  const onClickTimeSlot = (slot: TimeSlot) => {
    if (!slot.is_available) return;
    setSelectedDate(new Date(slot.date)); 
    setSelectedTimeSlot(slot);
    navigate('/reservation/details');
  };

  // ──────────────────────────────
  // 「サービス未選択なら戻す」ガード
  // ──────────────────────────────
  useEffect(() => {
    if (selectedServices.length === 0) {
      navigate('/reservation/services');
    }
  }, [selectedServices, navigate]);

  return (
    <div className="py-8 px-4 max-w-3xl mx-auto">
      {/* タイトル */}
      <h2 className="text-2xl font-serif font-bold text-purple-900 mb-6 text-center">
        希望日時選択
      </h2>

      {/* ───────────────
          月カレンダー部分
      ─────────────── */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <button
            onClick={goToPreviousMonth}
            className="text-lg text-gray-600 hover:text-gray-800"
            aria-label="前の一ヶ月へ"
          >
            &lt; 前の一ヶ月
          </button>
          <span className="text-xl font-medium">
            {format(displayedMonth, 'yyyy年 MM月')}
          </span>
          <button
            onClick={goToNextMonth}
            className="text-lg text-gray-600 hover:text-gray-800"
            aria-label="次の一ヶ月へ"
          >
            次の一ヶ月 &gt;
          </button>
        </div>

        {isLoadingMonth ? (
          <div className="flex justify-center py-8">
            <div className="animate-pulse h-8 w-32 bg-gray-300 rounded"></div>
          </div>
        ) : monthError ? (
          <p className="text-red-600 text-center">{monthError}</p>
        ) : (
          <div className="grid grid-cols-7 gap-1">
            {/* 曜日ヘッダー */}
            {['日', '月', '火', '水', '木', '金', '土'].map((wd) => (
              <div key={wd} className="text-center font-medium py-2">
                {wd}
              </div>
            ))}

            {/* 月初の空白セル */}
            {Array.from({ length: dayOfWeek(displayedMonth) }, (_, i) => (
              <div key={`empty-${i}`} />
            ))}

            {/* 当月の各日セルを描画 */}
            {monthDays.map((day) => {
              const isToday = isSameDay(day.date, todayStart);
              const isSelected =
                selectedDate && isSameDay(day.date, selectedDate);

              return (
                <button
                  key={format(day.date, 'yyyy-MM-dd')}
                  onClick={() => onClickMonthDay(day)}
                  className={`relative flex flex-col items-center justify-center h-20 border rounded-md transition-colors duration-200
                    ${
                      day.hasAvailable
                        ? 'cursor-pointer hover:bg-purple-50'
                        : 'bg-gray-200 cursor-not-allowed'
                    }
                    ${isToday ? 'ring-2 ring-purple-400' : ''}
                    ${isSelected ? 'bg-purple-200' : ''}
                  `}
                >
                  {/* 日付番号 */}
                  <span
                    className={`${
                      day.hasAvailable ? 'text-black' : 'text-gray-500'
                    }`}
                  >
                    {format(day.date, 'd')}
                  </span>
                  {/* ○ or × */}
                  <span className="absolute bottom-1 text-sm">
                    {day.hasAvailable ? (
                      <span className="text-blue-600">○</span>
                    ) : (
                      <span className="text-gray-500">×</span>
                    )}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* ───────────────
          1週間分グリッド部分（selectedDate があれば表示）
      ─────────────── */}
      {selectedDate && (
        <div className="mb-8">
          <h3 className="text-lg font-medium text-purple-800 mb-4">
            時間帯を選択（一週間）
          </h3>

          {isLoadingWeek ? (
            <div className="flex justify-center py-8">
              <div className="animate-pulse h-8 w-32 bg-gray-300 rounded"></div>
            </div>
          ) : weekError ? (
            <p className="text-red-600 text-center">{weekError}</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full border-collapse">
                <thead>
                  <tr>
                    <th className="border px-2 py-2 text-center">日時</th>
                    {weeklySlots.map((w) => (
                      <th
                        key={format(w.date, 'yyyy-MM-dd')}
                        className="border px-2 py-2 text-center"
                      >
                        <div className="text-sm">{format(w.date, 'MM/dd')}</div>
                        <div className="text-xs text-gray-600">
                          {['日', '月', '火', '水', '木', '金', '土'][w.date.getDay()]}
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {Array.from({ length: 22 }, (_, idx) => {
                    // 09:00 ～ 19:30（30分刻み）と仮定
                    const hour = 9 + Math.floor(idx / 2);
                    const minute = idx % 2 === 0 ? '00' : '30';
                    const timeLabel = `${hour.toString().padStart(2, '0')}:${minute}:00`;

                    return (
                      <tr key={timeLabel}>
                        <td className="border px-2 py-1 text-center text-sm">
                          {`${hour.toString().padStart(2, '0')}:${minute}`}
                        </td>
                        {weeklySlots.map((w) => {
                          const found = w.slots.find(
                            (s) => s.start_time === timeLabel
                          );

                          return (
                            <td
                              key={`${format(w.date, 'yyyy-MM-dd')}-${timeLabel}`}
                              className="border px-2 py-1 text-center"
                            >
                              <button
                                onClick={() => found && onClickTimeSlot(found)}
                                className={`w-8 h-8 mx-auto rounded-full transition-colors duration-150
                                  ${
                                    found
                                      ? found.is_available
                                        ? 'bg-green-100 hover:bg-green-200 text-green-800'
                                        : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                                      : 'text-gray-300 cursor-not-allowed'
                                  }
                                `}
                              >
                                {found
                                  ? found.is_available
                                    ? '○'
                                    : '×'
                                  : '-'}
                              </button>
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* 戻るボタン */}
      <div className="flex justify-start">
        <Button variant="outline" onClick={() => navigate('/reservation/services')}>
          &larr; 前に戻る
        </Button>
      </div>
    </div>
  );
};

// 「月の1日目の曜日（0=日,1=月,…6=土）を返す」ヘルパー
function dayOfWeek(date: Date): number {
  return startOfMonth(date).getDay();
}

export default DateTimeSelection;
