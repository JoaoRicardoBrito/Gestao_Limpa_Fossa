-- Migration 002: Add trucks table and caminhao_placa column to appointments
-- Apply via Supabase Dashboard → SQL Editor

CREATE TABLE trucks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  placa text UNIQUE NOT NULL,
  modelo text NOT NULL,
  ativo boolean DEFAULT true,
  criado_em timestamptz DEFAULT now()
);

ALTER TABLE appointments ADD COLUMN IF NOT EXISTS caminhao_placa text;

-- RLS for trucks: authenticated users only; anonymous users have no access
ALTER TABLE trucks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read trucks"
  ON trucks FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert trucks"
  ON trucks FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update trucks"
  ON trucks FOR UPDATE
  TO authenticated
  USING (true);

