/*
  # Create services table

  1. New Tables
    - `services`
      - `id` (integer, primary key)
      - `name` (text, not null)
      - `description` (text, not null)
      - `price` (integer, not null)
      - `duration` (integer, not null)
      - `image_url` (text, nullable)
      - `created_at` (timestamp with time zone, default: now())
  2. Security
    - Enable RLS on `services` table
    - Add policy for public access to read services data
*/

CREATE TABLE IF NOT EXISTS services (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  price INTEGER NOT NULL,
  duration INTEGER NOT NULL,
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE services ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Services are viewable by everyone"
  ON services
  FOR SELECT
  TO PUBLIC
  USING (true);

-- Insert sample services data
INSERT INTO services (name, description, price, duration, image_url)
VALUES
  ('Haircut & Style', 'Professional haircut and styling tailored to your preferences and face shape.', 6000, 60, 'https://images.pexels.com/photos/3993447/pexels-photo-3993447.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2'),
  ('Color Treatment', 'Full color service including consultation, application, and finishing style.', 9000, 120, 'https://images.pexels.com/photos/3993310/pexels-photo-3993310.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2'),
  ('Highlights', 'Add dimension with partial or full highlights customized to your desired look.', 12000, 150, 'https://images.pexels.com/photos/3993449/pexels-photo-3993449.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2'),
  ('Facial Treatment', 'Revitalizing facial customized for your skin type with premium products.', 8000, 60, 'https://images.pexels.com/photos/3997379/pexels-photo-3997379.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2'),
  ('Manicure & Pedicure', 'Complete nail care service including soak, shape, cuticle care, and polish.', 7000, 90, 'https://images.pexels.com/photos/939836/pexels-photo-939836.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2'),
  ('Massage Therapy', 'Relaxing full-body massage to release tension and promote wellness.', 8500, 60, 'https://images.pexels.com/photos/3997981/pexels-photo-3997981.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2');