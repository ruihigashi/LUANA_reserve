export interface Service {
  id: number;
  name: string;
  description: string;
  duration: number;
  price: number;
  category: string;
}

export interface SetMenu {
  id: number;
  name: string;
  description: string;
  duration: number;
  price: number;
  category: string;
}


export interface TimeSlot {
  id: number;
  date: string;         // 例: "2025-06-08"
  start_time: string;   // 例: "10:00:00"
  is_available: boolean;
}


export interface Reservation {
  id?: number;                     // 自動採番された予約ID
  customer_last_name: string;      // 姓
  customer_first_name: string;     // 名
  customer_last_name_kana: string; // セイ
  customer_first_name_kana: string;// メイ
  customer_phone: string;          // 電話番号
  date: string;                    // 予約日 (例: "2025-06-08")
  time_slot_id: number;            // time_slots テーブルの ID
  service_names: string;           // 選択したサービスをカンマ区切り文字列で保持 (例: "カット、カラー")
  total_price: number;             // 合計金額 (例: 9900)
  notes?: string;                  // 質問・備考(任意)
  created_at?: string;             // 登録日時 (TIMESTAMPTZ)
}
