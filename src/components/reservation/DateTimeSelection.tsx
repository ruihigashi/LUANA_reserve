// src/components/reservation/DateTimeSelection.tsx

import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  format,
  addDays,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameDay,
  isBefore,
  startOfDay,
} from 'date-fns'
import { useReservation } from '../../context/ReservationContext'
import { TimeSlot } from '../../types'
import { supabase } from '../../lib/supabase'
import Button from '../ui/Button'

interface DayAvailability {
  date: Date
  hasAvailable: boolean
}

interface WeeklySlot {
  date: Date
  slots: TimeSlot[]
}

const DateTimeSelection: React.FC = () => {
  const {
    selectedServices, // (Service | SetMenu)[]
    selectedDate,
    setSelectedDate,
    selectedTimeSlot,
    setSelectedTimeSlot,
  } = useReservation()
  const navigate = useNavigate()

  // 今日の日付（時刻部分を切り捨て）
  const [todayStart] = useState<Date>(startOfDay(new Date()))
  // 最大予約可能日 = 今日 + 45日
  const [maxSelectable] = useState<Date>(addDays(todayStart, 45))

  // 現在時刻
  const [now, setNow] = useState<Date>(new Date())

  // 時刻更新用（30秒ごと）
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 30 * 1000)
    return () => clearInterval(timer)
  }, [])

  // ──────────────────────────────────────────────
  // カレンダー月用ステート
  const [displayedMonth, setDisplayedMonth] = useState<Date>(new Date())
  const [monthDays, setMonthDays] = useState<DayAvailability[]>([])
  const [isLoadingMonth, setIsLoadingMonth] = useState<boolean>(false)
  const [monthError, setMonthError] = useState<string | null>(null)

  // 週間グリッド用ステート
  const [weeklySlots, setWeeklySlots] = useState<WeeklySlot[]>([])
  const [isLoadingWeek, setIsLoadingWeek] = useState<boolean>(false)
  const [weekError, setWeekError] = useState<string | null>(null)

  // ──────────────────────────────
  // 1) 月カレンダー用データ取得
  useEffect(() => {
    const fetchMonthAvailability = async () => {
      setIsLoadingMonth(true)
      setMonthError(null)

      try {
        const firstOfMonth = startOfMonth(displayedMonth)
        const lastOfMonth = endOfMonth(displayedMonth)
        const firstStr = format(firstOfMonth, 'yyyy-MM-dd')
        const lastStr = format(lastOfMonth, 'yyyy-MM-dd')

        const { data, error } = await supabase
          .from('time_slots')
          .select('date, is_available')
          .gte('date', firstStr)
          .lte('date', lastStr)

        if (error) throw error

        const availabilityMap: Record<string, boolean> = {}
        data?.forEach((slot: { date: string; is_available: boolean }) => {
          if (slot.is_available) {
            availabilityMap[slot.date] = true
          }
        })

        const daysArray = eachDayOfInterval({
          start: firstOfMonth,
          end: lastOfMonth,
        })

        const daysWithAvailability: DayAvailability[] = daysArray.map((d) => {
          const key = format(d, 'yyyy-MM-dd')
          // 過去日または最大予約日を超える日は不可
          if (isBefore(d, todayStart) || isBefore(maxSelectable, d)) {
            return { date: d, hasAvailable: false }
          }
          return {
            date: d,
            hasAvailable: availabilityMap[key] === true,
          }
        })

        setMonthDays(daysWithAvailability)
      } catch (e) {
        console.error('[DateTimeSelection] 月カレンダー取得エラー:', e)
        setMonthError('カレンダーの読み込みに失敗しました。')
      } finally {
        setIsLoadingMonth(false)
      }
    }

    fetchMonthAvailability()
  }, [displayedMonth, todayStart, maxSelectable])

  // ──────────────────────────────
  // 2) 週グリッド用のスロット取得
  useEffect(() => {
    if (!selectedDate) {
      setWeeklySlots([])
      return
    }

    const fetchWeeklySlots = async () => {
      setIsLoadingWeek(true)
      setWeekError(null)

      try {
        const weekDates = Array.from({ length: 7 }, (_, i) => addDays(selectedDate, i))
        const dateStrings = weekDates.map((d) => format(d, 'yyyy-MM-dd'))

        const { data, error } = await supabase
          .from('time_slots')
          .select('id, date, start_time, is_available')
          .in('date', dateStrings)
          .order('start_time', { ascending: true })

        if (error) throw error

        const grouped: Record<string, TimeSlot[]> = {}
        data?.forEach((slot: TimeSlot) => {
          if (!grouped[slot.date]) {
            grouped[slot.date] = []
          }
          grouped[slot.date].push(slot)
        })

        const weekSlotsArray: WeeklySlot[] = weekDates.map((d) => {
          const key = format(d, 'yyyy-MM-dd')
          return {
            date: d,
            slots: grouped[key] ?? [],
          }
        })

        setWeeklySlots(weekSlotsArray)
      } catch (e) {
        console.error('[DateTimeSelection] 週間スロット取得エラー:', e)
        setWeekError('空き時間の取得に失敗しました。')
      } finally {
        setIsLoadingWeek(false)
      }
    }

    fetchWeeklySlots()
  }, [selectedDate])

  // ──────────────────────────────
  // 月切り替え
  const goToPreviousMonth = () => {
    setDisplayedMonth((prev) => {
      const firstOfPrevMonth = addDays(startOfMonth(prev), -1)
      return startOfMonth(firstOfPrevMonth)
    })
  }
  const goToNextMonth = () => {
    const firstOfNextMonth = addDays(endOfMonth(displayedMonth), 1)
    setDisplayedMonth(startOfMonth(firstOfNextMonth))
  }

  // ──────────────────────────────
  // 月カレンダー日付クリック
  const onClickMonthDay = (day: DayAvailability) => {
    if (!day.hasAvailable) return
    setSelectedDate(day.date)
    setSelectedTimeSlot(null)
  }

  // ──────────────────────────────
  // 時間帯クリック時
  const onClickTimeSlot = (slot: TimeSlot) => {
    if (!slot.is_available) return
    setSelectedDate(new Date(slot.date))
    setSelectedTimeSlot(slot)
    navigate('/reservation/details')
  }

  // ──────────────────────────────
  // サービス未選択ガード
  useEffect(() => {
    if (selectedServices.length === 0) {
      navigate('/reservation/services')
    }
  }, [selectedServices, navigate])

  // ──────────────────────────────
  // サービスの合計所要スロット数を計算（30分刻みに換算）
  // 例: 120分 → 4 スロット
  const totalRequiredSlots = selectedServices.reduce((sum, svc) => {
    const slots = Math.ceil(svc.duration / 30)
    return sum + slots
  }, 0)

  // ──────────────────────────────
  // ある日のスロット一覧で、index から連続して "必要な数" の空きスロットがあるか？
  const hasConsecutiveSlots = (slots: TimeSlot[], startIndex: number) => {
    if (startIndex + totalRequiredSlots > slots.length) return false
    for (let i = startIndex; i < startIndex + totalRequiredSlots; i++) {
      if (!slots[i].is_available) {
        return false
      }
      // さらに、スロット日時自体が現在を過ぎていないかチェック
      const slotDateTime = new Date(`${slots[i].date}T${slots[i].start_time}`)
      if (slotDateTime < now) {
        return false
      }
    }
    return true
  }

  return (
    <div className="py-8 px-4 max-w-3xl mx-auto">
      {/* タイトル */}
      <h2 className="text-3xl font-serif font-bold text-blue-900 mb-6 text-center">
        希望日時を選択してください
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
              <div key={wd} className="text-center font-medium py-2 ">
                {wd}
              </div>
            ))}

            {/* 月初の空白セル */}
            {Array.from({ length: dayOfWeek(displayedMonth) }, (_, i) => (
              <div key={`empty-${i}`} />
            ))}

            {/* 当月の日付セル */}
            {monthDays.map((day) => {
              const isToday = isSameDay(day.date, todayStart)
              const isSelected =
                selectedDate && isSameDay(day.date, selectedDate)

              return (
                <button
                  key={format(day.date, 'yyyy-MM-dd')}
                  onClick={() => onClickMonthDay(day)}
                  className={`relative flex flex-col items-center justify-center h-16 border rounded-md transition-colors duration-200 
                        ${
                          day.hasAvailable
                            ? 'cursor-pointer bg-white hover:bg-blue-100 border-blue-200'
                            : 'bg-gray-200 cursor-not-allowed'
                        }
                        ${isToday ? 'ring-2 ring-blue-400' : ''}
                        ${isSelected ? 'bg-blue-200' : ''}
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
              )
            })}
          </div>
        )}
      </div>

      {/* ───────────────
          1週間分グリッド部分
      ─────────────── */}
      {selectedDate && (
        <div className="mb-8">
          <h3 className="text-2xl font-medium text-blue-800 mb-4 items-center flex justify-center">
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
              <table className="min-w-full border-collapse bg-white">
                <thead>
                  <tr>
                    <th className="border px-2 py-2 text-center">時刻</th>
                    {weeklySlots.map((w) => (
                      <th
                        key={format(w.date, 'yyyy-MM-dd')}
                        className="border px-2 py-2 text-center"
                      >
                        <div className="text-sm">
                          {format(w.date, 'MM/dd')}
                        </div>
                        <div className="text-xs text-gray-600">
                          {['日', '月', '火', '水', '木', '金', '土'][w.date.getDay()]}
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {Array.from({ length: 22 }, (_, idx) => {
                    // 09:00 ～ 19:30（30分刻み）
                    const hour = 9 + Math.floor(idx / 2)
                    const minute = idx % 2 === 0 ? '00' : '30'
                    const timeLabel = `${hour.toString().padStart(2, '0')}:${minute}:00`

                    return (
                      <tr key={timeLabel}>
                        <td className="border px-2 py-1 text-center text-sm bg-white">
                          {`${hour.toString().padStart(2, '0')}:${minute}`}
                        </td>
                        {weeklySlots.map((w) => {
                          const slots = w.slots
                          const index = slots.findIndex(
                            (s) => s.start_time === timeLabel
                          )
                          const found = index !== -1 ? slots[index] : undefined

                          // スロット日時を作成
                          const slotDateTime = new Date(
                            `${format(w.date, 'yyyy-MM-dd')}T${timeLabel}`
                          )

                          // ボタン表示用のテキストとクラスを決定
                          let cellText: string
                          let cellClass: string

                          // 日付が過去、あるいは最大予約可能日を超える場合は ×
                          if (
                            slotDateTime < now ||
                            isBefore(maxSelectable, w.date)
                          ) {
                            cellText = '×'
                            cellClass = 'bg-gray-200 text-gray-500 cursor-not-allowed'
                          } else if (!found) {
                            // そもそもスロットがない（レコードがない）→ "-"
                            cellText = '-'
                            cellClass = 'text-gray-300 cursor-not-allowed'
                          } else if (!found.is_available) {
                            // スロットはあるが is_available: false → "×"
                            cellText = '×'
                            cellClass = 'bg-gray-200 text-gray-500 cursor-not-allowed'
                          } else {
                            // スロットはあり、is_available: true
                            if (!hasConsecutiveSlots(slots, index)) {
                              // 連続スロット不足 → "-"
                              cellText = '-'
                              cellClass = 'text-gray-300 cursor-not-allowed'
                            } else {
                              // 連続スロット十分 → "○"
                              cellText = '○'
                              cellClass = 'bg-green-100 hover:bg-green-200 text-green-800'
                            }
                          }

                          return (
                            <td
                              key={`${format(w.date, 'yyyy-MM-dd')}-${timeLabel}`}
                              className="border px-2 py-1 text-center"
                            >
                              <button
                                onClick={() =>
                                  cellText === '○' && onClickTimeSlot(found!)
                                }
                                className={`w-8 h-8 mx-auto rounded-full transition-colors duration-150 ${cellClass}`}
                                disabled={cellText !== '○'}
                              >
                                {cellText}
                              </button>
                            </td>
                          )
                        })}
                      </tr>
                    )
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
  )
}

// 月初めの曜日を返す
function dayOfWeek(date: Date): number {
  return startOfMonth(date).getDay()
}

export default DateTimeSelection
