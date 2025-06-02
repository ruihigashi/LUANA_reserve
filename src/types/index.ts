// src/types/index.ts

/**
 * サービス情報
 * （これは以前と同じ定義でOKです）
 */
export interface Service {
  id: number;
  name: string;
  description: string;
  duration: number;
  price: number;
  category: string;
}


/**
 * セットメニュー情報
 * （Service とまったく同じ構造なので、テーブルを「set_menus」として
 *   データベースで管理している場合はこちらを使います）
 */
export interface SetMenu {
  id: number;
  name: string;
  description: string;
  duration: number;
  price: number;
  category: string;
}


/**
 * 時間枠情報
 * （date フィールドを追加しています）
 */
export interface TimeSlot {
  id: number;
  date: string;         // 例: "2025-06-08"
  start_time: string;   // 例: "10:00:00"
  is_available: boolean;
}


/**
 * 予約情報
 * 
 * データベース側で以下のように定義したテーブルに合わせています：
 *  - id                      SERIAL PRIMARY KEY
 *  - customer_last_name      VARCHAR(100) NOT NULL
 *  - customer_first_name     VARCHAR(100) NOT NULL
 *  - customer_last_name_kana VARCHAR(100) NOT NULL
 *  - customer_first_name_kana VARCHAR(100) NOT NULL
 *  - customer_phone          VARCHAR(20)  NOT NULL
 *  - date                    DATE         NOT NULL
 *  - time_slot_id            INT          NOT NULL (→ time_slots.id に対する外部キー)
 *  - service_names           TEXT         NOT NULL   ← カンマ区切りのサービス名
 *  - total_price             INT          NOT NULL   ← 合計金額（円）
 *  - notes                   TEXT                 NULL  ← 質問・備考
 *  - created_at              TIMESTAMPTZ   DEFAULT now()
 */
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
