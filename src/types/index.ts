export interface Service {
  id: number;
  name: string;
  description: string;
  price: number;
  duration: number;
  image_url?: string;
}

export interface TimeSlot {
  id: number;
  start_time: string;
  end_time: string;
  is_available: boolean;
}

export interface Reservation {
  id?: number;
  service_id: number;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  date: string;
  time_slot_id: number;
  notes?: string;
  created_at?: string;
}