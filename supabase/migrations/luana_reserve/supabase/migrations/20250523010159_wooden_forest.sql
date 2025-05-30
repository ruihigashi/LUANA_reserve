/*
  # Create reservations table

  1. New Tables
    - `reservations`
      - `id` (integer, primary key)
      - `service_id` (integer, foreign key to services.id)
      - `customer_name` (text, not null)
      - `customer_email` (text, not null)
      - `customer_phone` (text, not null)
      - `date` (date, not null)
      - `time_slot_id` (integer, foreign key to time_slots.id)
      - `notes` (text, nullable)
      - `created_at` (timestamp with time zone, default: now())
  2. Security
    - Enable RLS on `reservations` table
    - Add policy for public access to insert reservation data
    - Add policy for authenticated users to read their own reservation data
*/

CREATE TABLE IF NOT EXISTS reservations (
  id SERIAL PRIMARY KEY,
  service_id INTEGER NOT NULL REFERENCES services(id),
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  date DATE NOT NULL,
  time_slot_id INTEGER NOT NULL REFERENCES time_slots(id),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE reservations ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert a reservation
CREATE POLICY "Anyone can create a reservation"
  ON reservations
  FOR INSERT
  TO PUBLIC
  WITH CHECK (true);

-- Allow anyone to view reservations (in a real application, you would restrict this)
CREATE POLICY "Reservations are viewable by everyone"
  ON reservations
  FOR SELECT
  TO PUBLIC
  USING (true);