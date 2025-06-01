// src/types.ts

// ──────────────────────────────────────────────────────────────
// Service 型はそのまま（変更不要）
// ──────────────────────────────────────────────────────────────
export interface Service {
  id: number;
  name: string;
  description: string;
  duration: number;   // 例: 30 （分）
  price: number;      // 例: 2750
  category: string;   // 例: "Cut"、"Color"、"その他"
}

// ──────────────────────────────────────────────────────────────
// TimeSlot 型から不要な end_time, created_at を排除。
// date / start_time / is_available のみを残す。
// ──────────────────────────────────────────────────────────────
export interface TimeSlot {
  id: number;
  date: string;        // YYYY-MM-DD 形式
  start_time: string;  // HH:mm:ss 形式（例: "09:00:00"）
  is_available: boolean;
}

// ──────────────────────────────────────────────────────────────
// Reservation 型も、DBに保存する際に必要であれば残します。
// ──────────────────────────────────────────────────────────────
export interface Reservation {
  id?: number;
  service_id: number;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  date: string;         // YYYY-MM-DD 形式
  time_slot_id: number;
  notes?: string;
  created_at?: string;  // 保持したい場合のみ残す（今回は不要なら省略可）
}
