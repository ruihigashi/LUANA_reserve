// src/components/reservation/ServiceAccordion.tsx

import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ChevronDown,
  ChevronUp,
  Star,
  Puzzle,
  Search,
  X, // 追加: ×（クローズ）アイコン
} from 'lucide-react'
import { Service, SetMenu } from '../../types'
import { supabase } from '../../lib/supabase'
import Button from '../ui/Button'
import { useReservation } from '../../context/ReservationContext'

const ServiceAccordion: React.FC = () => {
  // ───────────────────────────────────────────────
  // 1) タブ切り替え用の state
  //    'single' → 単品メニュー (services テーブル)
  //    'set'    → セットメニュー (set_menus テーブル)
  // ───────────────────────────────────────────────
  const [menuType, setMenuType] = useState<'single' | 'set'>('single')

  // ───────────────────────────────────────────────
  // 2) 絞り込みセクション開閉用の state
  // ───────────────────────────────────────────────
  const [isFilterOpen, setIsFilterOpen] = useState<boolean>(false)

  // ───────────────────────────────────────────────
  // 3) 絞り込み用のカテゴリ state ('all' で未絞り込み、各カテゴリ名を保持)
  // ───────────────────────────────────────────────
  const [selectedCategory, setSelectedCategory] = useState<string>('all')

  // ───────────────────────────────────────────────
  // 4) 取得したメニューアイテムを格納 (Service 型で共通に扱う)
  // ───────────────────────────────────────────────
  const [services, setServices] = useState<Service[]>([])
  const [grouped, setGrouped] = useState<Record<string, Service[]>>({})
  const [openCats, setOpenCats] = useState<Record<string, boolean>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const { selectedServices, setSelectedServices } = useReservation()
  const navigate = useNavigate()

  // ───────────────────────────────────────────────
  // 5) menuType が変更されたらデータを取得し直す
  //    - 単品メニュー → 'services' テーブル（Service 型）
  //    - セットメニュー → 'set_menus' テーブル（SetMenu 型）
  // ───────────────────────────────────────────────
  useEffect(() => {
    ;(async () => {
      try {
        setLoading(true)
        setError(null)

        if (menuType === 'single') {
          // ─────────────────────────────────────────────
          // 単品メニューを取得 (Service 型)
          // ─────────────────────────────────────────────
          const { data, error: fetchError } = await supabase
            .from<'services', Service>('services')
            .select('*')
            .order('id', { ascending: true })

          if (fetchError) throw fetchError
          setServices(data || [])
        } else {
          // ─────────────────────────────────────────────
          // セットメニューを取得 (SetMenu 型)
          // ここで SetMenu[] を取得しつつ、Service[] として扱う
          // ─────────────────────────────────────────────
          const { data, error: fetchError } = await supabase
            .from<'set_menus', SetMenu>('set_menus')
            .select('*')
            .order('id', { ascending: true })

          if (fetchError) throw fetchError
          setServices(data || [])
        }
      } catch (e) {
        console.error(e)
        setError('メニューの読み込みに失敗しました。')
      } finally {
        setLoading(false)
      }
    })()

    // タブ切り替え時に絞り込みを閉じてカテゴリもリセット
    setIsFilterOpen(false)
    setSelectedCategory('all')
  }, [menuType])

  // ───────────────────────────────────────────────
  // 6) services 配列が更新されたら、カテゴリ別にグルーピング
  // ───────────────────────────────────────────────
  useEffect(() => {
    const map: Record<string, Service[]> = {}
    services.forEach((s) => {
      const cat = s.category?.trim() || 'その他'
      if (!map[cat]) map[cat] = []
      map[cat].push(s)
    })
    setGrouped(map)
  }, [services])

  // ───────────────────────────────────────────────
  // 7) grouped がセットされたら、すべてのカテゴリを開いた状態にする
  // ───────────────────────────────────────────────
  useEffect(() => {
    const initialOpen: Record<string, boolean> = {}
    Object.keys(grouped).forEach((cat) => {
      initialOpen[cat] = true
    })
    setOpenCats(initialOpen)
  }, [grouped])

  // ───────────────────────────────────────────────
  // 8) カテゴリ開閉のトグル
  // ───────────────────────────────────────────────
  const toggleCategory = (cat: string) => {
    setOpenCats((prev) => ({ ...prev, [cat]: !prev[cat] }))
  }

  // ───────────────────────────────────────────────
  // 9) メニュー選択／解除（複数選択可能）
  // ───────────────────────────────────────────────
  const toggleSelect = (svc: Service) => {
    if (selectedServices.some((s) => s.id === svc.id)) {
      setSelectedServices(selectedServices.filter((s) => s.id !== svc.id))
    } else {
      setSelectedServices([...selectedServices, svc])
    }
  }

  // ───────────────────────────────────────────────
  // 10) 「日時を選択」へ進むボタン押下
  //    → 1件以上選択されていれば次ページへ
  // ───────────────────────────────────────────────
  const handleContinue = () => {
    if (selectedServices.length > 0) {
      navigate('/reservation/datetime')
    }
  }

  // ───────────────────────────────────────────────
  // 11) ローディング中／エラー時
  // ───────────────────────────────────────────────
  if (loading)
    return <p className="p-8 text-center text-gray-500">読み込み中…</p>
  if (error)
    return <p className="p-8 text-center text-red-600">{error}</p>

  return (
    <div className="relative w-full py-8 bg-blue-50 pb-32">
      {/* ───────────────────────────────────────────── */}
      {/* タブ部分：セット or 単品 */}
      {/* ───────────────────────────────────────────── */}
      <div className="flex justify-center space-x-4 mb-8">
        {/* セットメニュー タブ */}
        <button
          onClick={() => setMenuType('set')}
          className={`
            flex items-center space-x-2 px-6 py-3 rounded-xl
            transition-colors duration-200
            ${menuType === 'set'
              ? 'bg-blue-100 text-blue-800'
              : 'bg-white text-gray-600 hover:bg-gray-100'
            }
          `}
        >
          <Star className="w-5 h-5" />
          <span className="font-medium text-sm">セットメニュー</span>
        </button>

        {/* 単品メニュー タブ */}
        <button
          onClick={() => setMenuType('single')}
          className={`
            flex items-center space-x-2 px-6 py-3 rounded-xl
            transition-colors duration-200
            ${menuType === 'single'
              ? 'bg-blue-100 text-blue-800'
              : 'bg-white text-gray-600 hover:bg-gray-100'
            }
          `}
        >
          <Puzzle className="w-5 h-5" />
          <span className="font-medium text-sm">単品メニュー</span>
        </button>
      </div>

      {/* ───────────────────────────────────────────── */}
      {/* 絞り込みボタン（折りたたみ式） */}
      {/* ───────────────────────────────────────────── */}
      <div className="flex justify-center mb-6 px-4">
        <button
          onClick={() => setIsFilterOpen((prev) => !prev)}
          className={`
            flex items-center justify-center w-full max-w-md px-4 py-2
            border border-gray-300 bg-white text-gray-700 rounded-full
            shadow-sm hover:bg-gray-100 transition-colors duration-200
          `}
        >
          {isFilterOpen ? (
            <>
              <X className="w-5 h-5 mr-2" />
              <span>メニューを閉じる</span>
            </>
          ) : (
            <>
              <Search className="w-5 h-5 mr-2" />
              <span>メニューを絞り込み</span>
            </>
          )}
        </button>
      </div>

      {/* ───────────────────────────────────────────── */}
      {/* 絞り込み項目（カテゴリボタン群） */}
      {/* isFilterOpen が true のときだけ表示 */}
      {/* ───────────────────────────────────────────── */}
      {isFilterOpen && (
        <div className="flex flex-wrap justify-center mb-8 px-4">
          {/* 「全て」ボタン */}
          <button
            onClick={() => setSelectedCategory('all')}
            className={`
              mx-2 my-1 px-4 py-2 rounded-full text-sm font-medium
              ${selectedCategory === 'all'
                ? 'bg-blue-600 text-white'
                : 'border border-blue-600 text-blue-600 hover:bg-blue-100'
              }
            `}
          >
            全て
          </button>

          {/* grouped のキー（カテゴリ名）をループしてボタン生成 */}
          {Object.keys(grouped).map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`
                mx-2 my-1 px-4 py-2 rounded-full text-sm font-medium
                ${selectedCategory === cat
                  ? 'bg-blue-600 text-white'
                  : 'border border-blue-600 text-blue-600 hover:bg-blue-100'
                }
              `}
            >
              {cat}
            </button>
          ))}
        </div>
      )}

      {/* ───────────────────────────────────────────── */}
      {/* 見出し */}
      {/* ───────────────────────────────────────────── */}
      <h2 className="text-xl font-serif font-extrabold text-center text-blue-900 mb-10">
        {menuType === 'set'
          ? 'セットメニューを選択してください'
          : '単品メニューを選択してください'}
      </h2>

      {/* ───────────────────────────────────────────── */}
      {/* アコーディオン表示部分（カテゴリごとに表示） */}
      {/* ───────────────────────────────────────────── */}
      {Object.entries(grouped)
        // 絞り込み：selectedCategory が 'all' のときは全件、それ以外は選択中カテゴリのみ
        .filter(([cat]) => {
          return selectedCategory === 'all' || cat === selectedCategory
        })
        .map(([cat, items]) => {
          const isOpen = openCats[cat] || false

          return (
            <div
              key={cat}
              className="mb-8 border rounded-2xl shadow-lg bg-white overflow-hidden transition-all duration-300"
            >
              {/* カテゴリヘッダー */}
              <button
                onClick={() => toggleCategory(cat)}
                className={`
                  w-full flex justify-between items-center px-8 py-5
                  bg-gradient-to-r from-blue-600 to-blue-800
                  hover:from-blue-700 hover:to-blue-900
                  transition-colors duration-300
                `}
              >
                <span className="font-semibold text-2xl text-white">
                  {cat}
                </span>
                {isOpen ? (
                  <ChevronUp className="w-7 h-7 text-white transition-transform duration-200" />
                ) : (
                  <ChevronDown className="w-7 h-7 text-white transition-transform duration-200" />
                )}
              </button>

              {/* カテゴリ内アイテム（アコーディオン中身） */}
              <div
                className={`
                  overflow-hidden transition-[max-height] duration-300 ease-in-out
                  ${isOpen ? 'max-h-[2000px]' : 'max-h-0'}
                `}
              >
                {items.map((s) => {
                  const isSelected = selectedServices.some(
                    (sel) => sel.id === s.id
                  )
                  return (
                    <div
                      key={s.id}
                      onClick={() => toggleSelect(s)}
                      className={`
                        flex justify-between items-start px-8 py-6 border-t
                        cursor-pointer transition-all duration-200
                        ${isSelected
                          ? 'bg-blue-50 border-blue-300'
                          : 'hover:bg-blue-50'
                        }
                      `}
                    >
                      {/* メニュー情報 */}
                      <div className="space-y-1">
                        <p className="font-bold text-lg text-gray-800">
                          {s.name}
                        </p>
                        {s.price > 0 && (
                          <p className="text-blue-700 font-semibold">
                            ¥{s.price.toLocaleString()}
                          </p>
                        )}
                        <p className="text-sm text-gray-600">
                          {s.description}
                        </p>
                      </div>

                      {/* 選択中バッジ */}
                      {isSelected && (
                        <span className="text-sm bg-green-100 text-green-800 px-3 py-1 rounded-full">
                          選択中
                        </span>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}

      {/* ───────────────────────────────────────────── */}
      {/* 固定フッター：選択済みアイテムが 1件以上あれば表示 */}
      {/* ───────────────────────────────────────────── */}
      {selectedServices.length > 0 && (
        <div className="fixed bottom-0 left-0 w-full bg-white border-t shadow-xl p-5 z-30">
          <div className="mb-4 overflow-x-auto whitespace-nowrap">
            {selectedServices.map((s) => (
              <span
                key={s.id}
                className="inline-block bg-blue-100 text-blue-800 px-4 py-2 mr-3 rounded-2xl text-sm font-medium shadow-sm"
              >
                {s.name}
              </span>
            ))}
          </div>
          <Button
            onClick={handleContinue}
            className="w-full bg-gradient-to-r from-blue-800 to-blue-700 hover:from-blue-900 hover:to-blue-800 text-white py-4 font-semibold rounded-xl shadow-md transition-colors duration-300"
          >
            日時を選択 ({selectedServices.length})
          </Button>
        </div>
      )}
    </div>
  )
}

export default ServiceAccordion
