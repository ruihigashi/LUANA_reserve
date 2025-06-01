// src/components/reservation/ServiceAccordion.tsx

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { Service } from '../../types';
import { supabase } from '../../lib/supabase';
import Button from '../ui/Button';
import { useReservation } from '../../context/ReservationContext';

const ServiceAccordion: React.FC = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [grouped, setGrouped]   = useState<Record<string, Service[]>>({});
  const [openCats, setOpenCats] = useState<Record<string, boolean>>({});
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState<string | null>(null);

  const { selectedServices, setSelectedServices } = useReservation();
  const navigate = useNavigate();

  // 1) Supabase からサービス一覧を取得
  useEffect(() => {
    (async () => {
      try {
        const { data, error } = await supabase
          .from('services')
          .select('*')
          .order('id', { ascending: true });
        if (error) throw error;
        setServices(data || []);
      } catch (e) {
        console.error(e);
        setError('サービスの読み込みに失敗しました。');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // 2) services が更新されたら、カテゴリごとにグルーピング
  useEffect(() => {
    const map: Record<string, Service[]> = {};
    services.forEach((s) => {
      const cat = s.category?.trim() || 'その他';
      ;(map[cat] ||= []).push(s);
    });
    setGrouped(map);
  }, [services]);

  // 3) grouped がセットされたら、すべてのカテゴリを開いた状態に
  useEffect(() => {
    const initialOpen: Record<string, boolean> = {};
    Object.keys(grouped).forEach((cat) => {
      initialOpen[cat] = true;
    });
    setOpenCats(initialOpen);
  }, [grouped]);

  // 4) カテゴリ開閉のトグル
  const toggleCategory = (cat: string) => {
    setOpenCats((prev) => ({ ...prev, [cat]: !prev[cat] }));
  };

  // 5) メニュー選択／解除（複数選択可能）
  const toggleSelect = (svc: Service) => {
    if (selectedServices.some((s) => s.id === svc.id)) {
      setSelectedServices(selectedServices.filter((s) => s.id !== svc.id));
    } else {
      setSelectedServices([...selectedServices, svc]);
    }
  };

  // 6) 次へ：1件以上選択されていれば日時選択へ
  const handleContinue = () => {
    if (selectedServices.length > 0) {
      navigate('/reservation/datetime');
    }
  };

  if (loading) return <p className="p-8 text-center text-gray-500">読み込み中…</p>;
  if (error)   return <p className="p-8 text-center text-red-600">{error}</p>;

  return (
    // フッター領域の確保のため余白を pb-32 にしています
    <div className="relative w-full py-8 bg-gray-50 pb-32">
      <h2 className="text-3xl font-serif font-extrabold text-center text-purple-900 mb-10">
        メニューを選択してください
      </h2>

      {Object.entries(grouped).map(([cat, items]) => {
        const isOpen = openCats[cat] || false;

        return (
          <div
            key={cat}
            className="mb-8 border rounded-2xl shadow-lg bg-white overflow-hidden transition-all duration-300"
          >
            {/* カテゴリヘッダー */}
            <button
              className={`
                w-full flex justify-between items-center px-8 py-5 
                bg-gradient-to-r from-purple-200 to-purple-100 
                hover:from-purple-300 hover:to-purple-200 
                transition-colors duration-300
              `}
              onClick={() => toggleCategory(cat)}
            >
              <span className="font-semibold text-xl text-purple-800">{cat}</span>
              {isOpen ? (
                <ChevronUp className="w-7 h-7 text-purple-600 transition-transform duration-200" />
              ) : (
                <ChevronDown className="w-7 h-7 text-purple-600 transition-transform duration-200" />
              )}
            </button>

            {/* アコーディオンの中身（max-height を 2000px に上げて切れないように） */}
            <div
              className={`
                overflow-hidden transition-[max-height] duration-300 ease-in-out
                ${isOpen ? 'max-h-[2000px]' : 'max-h-0'}
              `}
            >
              {items.map((s) => {
                const isSelected = selectedServices.some((sel) => sel.id === s.id);
                return (
                  <div
                    key={s.id}
                    onClick={() => toggleSelect(s)}
                    className={`
                      flex justify-between items-start px-8 py-6 border-t 
                      cursor-pointer 
                      transition-all duration-200
                      ${
                        isSelected
                          ? 'bg-purple-50 border-purple-300'
                          : 'hover:bg-pink-50'
                      }
                    `}
                  >
                    {/* 左：メニュー情報 */}
                    <div className="space-y-1">
                      <p className="font-bold text-lg text-gray-800">{s.name}</p>
                      {s.price > 0 && (
                        <p className="text-purple-700 font-semibold">
                          ¥{s.price.toLocaleString()}
                        </p>
                      )}
                      <p className="text-sm text-gray-600">{s.description}</p>
                    </div>

                    {/* 右：選択中バッジ */}
                    {isSelected && (
                      <span className="text-sm bg-green-100 text-green-800 px-3 py-1 rounded-full">
                        選択中
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}

      {/* 固定フッター（選択済みがあれば表示） */}
      {selectedServices.length > 0 && (
        <div className="fixed bottom-0 left-0 w-full bg-white border-t shadow-xl p-5 z-30">
          <div className="mb-4 overflow-x-auto whitespace-nowrap">
            {selectedServices.map((s) => (
              <span
                key={s.id}
                className="inline-block bg-green-100 text-green-800 px-4 py-2 mr-3 rounded-2xl text-sm font-medium shadow-sm"
              >
                {s.name}
              </span>
            ))}
          </div>
          <Button
            onClick={handleContinue}
            className="w-full bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-700 hover:to-purple-600 text-white py-4 font-semibold rounded-xl shadow-md transition-colors duration-300"
          >
            日時を選択 ({selectedServices.length})
          </Button>
        </div>
      )}
    </div>
  );
};

export default ServiceAccordion;
