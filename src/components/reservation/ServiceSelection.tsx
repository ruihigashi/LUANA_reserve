import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { Service } from '../../types';
import { supabase } from '../../lib/supabase';
import Button from '../ui/Button';

const ServiceAccordion: React.FC = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [grouped, setGrouped] = useState<Record<string, Service[]>>({});
  const [openCats, setOpenCats] = useState<Record<string, boolean>>({});
  // ローカルで複数選択を保持
  const [selectedServices, setSelectedServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  // サービス一覧を取得
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

  // カテゴリでグルーピング
  useEffect(() => {
    const map: Record<string, Service[]> = {};
    services.forEach(s => {
      const cat = s.category?.trim() || 'その他';
      (map[cat] ||= []).push(s);
    });
    setGrouped(map);
  }, [services]);

  // アコーディオン開閉
  const toggleCategory = (cat: string) => {
    setOpenCats(prev => ({ ...prev, [cat]: !prev[cat] }));
  };

  // メニュー選択／解除
  const toggleSelect = (svc: Service) => {
    setSelectedServices(prev =>
      prev.some(s => s.id === svc.id)
        ? prev.filter(s => s.id !== svc.id)
        : [...prev, svc]
    );
  };

  // 次へ (選択済みを state で渡す)
  const handleContinue = () => {
    if (selectedServices.length > 0) {
      navigate('/reservation/datetime', { state: { selectedServices } });
    }
  };

  if (loading) return <p className="p-8 text-center">読み込み中…</p>;
  if (error) return <p className="p-8 text-center text-red-600">{error}</p>;

  return (
    <div className="w-full py-8 bg-white">
      <h2 className="text-2xl font-bold text-center mb-6">
        メニューを選択してください
      </h2>

      {Object.entries(grouped).map(([cat, items]) => (
        <div key={cat} className="mb-4 border rounded-lg overflow-hidden">
          <button
            className="w-full flex justify-between items-center px-6 py-3 bg-gray-100 hover:bg-gray-200"
            onClick={() => toggleCategory(cat)}
          >
            <span className="font-semibold text-base">{cat}</span>
            {openCats[cat] ? (
              <ChevronUp className="w-5 h-5 text-gray-600" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-600" />
            )}
          </button>

          {openCats[cat] && (
            <div className="bg-white">
              {items.map(s => (
                <div
                  key={s.id}
                  onClick={() => toggleSelect(s)}
                  className={`px-6 py-4 border-t cursor-pointer flex justify-between items-center ${
                    selectedServices.some(sel => sel.id === s.id)
                      ? 'bg-purple-50'
                      : ''
                  }`}
                >
                  <div>
                    <p className="font-bold text-base mb-1">{s.name}</p>
                    {s.price > 0 && (
                      <p className="font-medium mb-1">¥{s.price.toLocaleString()}</p>
                    )}
                    <p className="text-sm text-gray-600">{s.description}</p>
                  </div>
                  {selectedServices.some(sel => sel.id === s.id) && (
                    <span className="text-sm text-green-600 font-semibold">選択中</span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      ))}

      {selectedServices.length > 0 && (
        <div className="fixed bottom-0 left-0 w-full bg-white border-t p-4">
          <div className="mb-2 overflow-x-auto whitespace-nowrap">
            {selectedServices.map(s => (
              <span
                key={s.id}
                className="inline-block bg-green-100 text-green-800 px-3 py-1 mr-2 rounded-full text-sm"
              >
                {s.name}
              </span>
            ))}
          </div>
          <Button onClick={handleContinue} className="w-full">
            日時を選択 ({selectedServices.length})
          </Button>
        </div>
      )}
    </div>
  );
};

export default ServiceAccordion;
