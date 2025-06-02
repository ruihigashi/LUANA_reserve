// src/components/reservation/ServiceAccordion.tsx

import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
    ChevronDown,
    ChevronUp,
    Star,
    Puzzle,
} from 'lucide-react'
import { Service, SetMenu } from '../../types'
import { supabase } from '../../lib/supabase'
import { PostgrestError } from '@supabase/supabase-js'
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
    // 2) 取得したメニューアイテムを格納 (Service 型で共通に扱う)
    // ───────────────────────────────────────────────
    const [services, setServices] = useState<Service[]>([])
    const [grouped, setGrouped] = useState<Record<string, Service[]>>({})
    const [openCats, setOpenCats] = useState<Record<string, boolean>>({})
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const { selectedServices, setSelectedServices } = useReservation()
    const navigate = useNavigate()

    // ───────────────────────────────────────────────
    // 3) menuType が変更されたらデータを取得し直す
    //    - 単品メニュー → 'services' テーブル（Service 型）
    //    - セットメニュー → 'set_menus' テーブル（SetMenu 型）
    // ───────────────────────────────────────────────
    useEffect(() => {
        ; (async () => {
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
                    // SetMenu と Service は構造が同じなので、そのまま Service[] にセット
                    setServices(data || [])
                }
            } catch (e) {
                console.error(e)
                setError('メニューの読み込みに失敗しました。')
            } finally {
                setLoading(false)
            }
        })()
    }, [menuType])

    // ───────────────────────────────────────────────
    // 4) services 配列が更新されたら、カテゴリ別にグルーピング
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
    // 5) grouped がセットされたら、すべてのカテゴリを開いた状態にする
    // ───────────────────────────────────────────────
    useEffect(() => {
        const initialOpen: Record<string, boolean> = {}
        Object.keys(grouped).forEach((cat) => {
            initialOpen[cat] = true
        })
        setOpenCats(initialOpen)
    }, [grouped])

    // ───────────────────────────────────────────────
    // 6) カテゴリ開閉のトグル
    // ───────────────────────────────────────────────
    const toggleCategory = (cat: string) => {
        setOpenCats((prev) => ({ ...prev, [cat]: !prev[cat] }))
    }

    // ───────────────────────────────────────────────
    // 7) メニュー選択／解除（複数選択可能）
    // ───────────────────────────────────────────────
    const toggleSelect = (svc: Service) => {
        if (selectedServices.some((s) => s.id === svc.id)) {
            setSelectedServices(selectedServices.filter((s) => s.id !== svc.id))
        } else {
            setSelectedServices([...selectedServices, svc])
        }
    }

    // ───────────────────────────────────────────────
    // 8) 「日時を選択」へ進むボタン押下
    //    → 1件以上選択されていれば次ページへ
    // ───────────────────────────────────────────────
    const handleContinue = () => {
        if (selectedServices.length > 0) {
            navigate('/reservation/datetime')
        }
    }

    // ───────────────────────────────────────────────
    // 9) ローディング中／エラー時
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
                    <span className="font-medium">セットメニュー</span>
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
                    <span className="font-medium">単品メニュー</span>
                </button>
            </div>

            {/* ───────────────────────────────────────────── */}
            {/* 見出し */}
            {/* ───────────────────────────────────────────── */}
            <h2 className="text-3xl font-serif font-extrabold text-center text-blue-900 mb-10">
                {menuType === 'set'
                    ? 'セットメニューを選択してください'
                    : '単品メニューを選択してください'}
            </h2>

            {/* ───────────────────────────────────────────── */}
            {/* アコーディオン表示部分 */}
            {/* ───────────────────────────────────────────── */}
            {Object.entries(grouped).map(([cat, items]) => {
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
