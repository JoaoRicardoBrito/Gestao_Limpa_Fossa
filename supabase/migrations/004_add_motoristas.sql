-- Migration 004: Add motoristas table and motorista_id column to appointments
-- Apply via Supabase Dashboard → SQL Editor

CREATE TABLE motoristas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text NOT NULL,
  telefone text NOT NULL,
  ativo boolean DEFAULT true,
  criado_em timestamptz DEFAULT now()
);

ALTER TABLE appointments ADD COLUMN IF NOT EXISTS motorista_id uuid REFERENCES motoristas(id);

-- RLS for motoristas: authenticated users only; anonymous users have no access (D-10)
ALTER TABLE motoristas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read motoristas"
  ON motoristas FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert motoristas"
  ON motoristas FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update motoristas"
  ON motoristas FOR UPDATE
  TO authenticated
  USING (true);
