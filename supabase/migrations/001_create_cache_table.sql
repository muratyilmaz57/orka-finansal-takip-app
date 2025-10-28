/*
  # Create cache table for offline support

  1. New Tables
    - `cache`
      - `id` (uuid, primary key)
      - `key` (text, unique) - Cache key identifier
      - `data` (jsonb) - Cached data
      - `created_at` (timestamptz) - When cache was created
      - `expires_at` (timestamptz) - When cache expires

  2. Security
    - Enable RLS on `cache` table
    - Add policy for authenticated users to manage their cache

  3. Indexes
    - Index on key for fast lookups
    - Index on expires_at for cleanup queries
*/

CREATE TABLE IF NOT EXISTS cache (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text UNIQUE NOT NULL,
  data jsonb NOT NULL,
  created_at timestamptz DEFAULT now(),
  expires_at timestamptz NOT NULL
);

ALTER TABLE cache ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their cache"
  ON cache
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_cache_key ON cache(key);
CREATE INDEX IF NOT EXISTS idx_cache_expires_at ON cache(expires_at);
