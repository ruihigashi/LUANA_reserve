/*
  # Create time slots table

  1. New Tables
    - `time_slots`
      - `id` (integer, primary key)
      - `start_time` (time, not null)
      - `end_time` (time, not null)
      - `is_available` (boolean, default: true)
      - `created_at` (timestamp with time zone, default: now())
  2. Security
    - Enable RLS on `time_slots` table
    - Add policy for public access to read time slots data
*/

-- Create time_slots table with `date`
CREATE TABLE IF NOT EXISTS time_slots (
  id SERIAL PRIMARY KEY,
  date DATE NOT NULL, -- 日付を追加！
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  is_available BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE time_slots ENABLE ROW LEVEL SECURITY;

-- Public read access
CREATE POLICY "Time slots are viewable by everyone"
  ON time_slots
  FOR SELECT
  TO PUBLIC
  USING (true);

-- Insert sample time slots for today (or pick any date)
INSERT INTO time_slots (date, start_time, end_time)
VALUES
  (CURRENT_DATE, '09:00:00', '10:00:00'),
  (CURRENT_DATE, '10:00:00', '11:00:00'),
  (CURRENT_DATE, '11:00:00', '12:00:00'),
  (CURRENT_DATE, '12:00:00', '13:00:00'),
  (CURRENT_DATE, '13:00:00', '14:00:00'),
  (CURRENT_DATE, '14:00:00', '15:00:00'),
  (CURRENT_DATE, '15:00:00', '16:00:00'),
  (CURRENT_DATE, '16:00:00', '17:00:00'),
  (CURRENT_DATE, '17:00:00', '18:00:00');