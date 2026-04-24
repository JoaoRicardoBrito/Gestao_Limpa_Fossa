-- =====================================================================
-- Migration 001: Adiciona campos de gestão à tabela appointments
-- =====================================================================
-- Esta migration adiciona os campos necessários para o painel de gestão
-- controlar status, concluir, cancelar e anotar observações nos
-- agendamentos recebidos pelo site público.
--
-- IMPORTANTE: A tabela `appointments` já existe e já está em uso pelo
-- site público. Esta migration apenas ADICIONA colunas — não altera
-- nem remove nada existente.
-- =====================================================================

-- 1. Adiciona novos campos
ALTER TABLE appointments
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'pendente'
    CHECK (status IN ('pendente', 'em_andamento', 'concluido', 'cancelado')),
  ADD COLUMN IF NOT EXISTS concluido_em timestamptz,
  ADD COLUMN IF NOT EXISTS cancelado_em timestamptz,
  ADD COLUMN IF NOT EXISTS motivo_cancelamento text,
  ADD COLUMN IF NOT EXISTS notas text,
  ADD COLUMN IF NOT EXISTS valor numeric(10,2),
  ADD COLUMN IF NOT EXISTS atualizado_em timestamptz DEFAULT now();

-- 2. Índices para performance das queries do painel
CREATE INDEX IF NOT EXISTS idx_appointments_status
  ON appointments(status);

CREATE INDEX IF NOT EXISTS idx_appointments_data_hora
  ON appointments(data_hora);

-- 3. Trigger para manter `atualizado_em` automaticamente
CREATE OR REPLACE FUNCTION update_atualizado_em_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.atualizado_em = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_atualizado_em ON appointments;
CREATE TRIGGER set_atualizado_em
  BEFORE UPDATE ON appointments
  FOR EACH ROW
  EXECUTE FUNCTION update_atualizado_em_column();

-- =====================================================================
-- 4. Políticas RLS para usuários autenticados
-- =====================================================================
-- A política de INSERT para `anon` já existe (site público usa).
-- Aqui adicionamos as políticas para o painel de gestão.
-- =====================================================================

-- Garante que RLS está habilitado (idempotente)
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;

-- SELECT: apenas usuários autenticados podem ler
DROP POLICY IF EXISTS "Authenticated users can read appointments" ON appointments;
CREATE POLICY "Authenticated users can read appointments"
  ON appointments
  FOR SELECT
  TO authenticated
  USING (true);

-- UPDATE: apenas usuários autenticados podem atualizar
DROP POLICY IF EXISTS "Authenticated users can update appointments" ON appointments;
CREATE POLICY "Authenticated users can update appointments"
  ON appointments
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- DELETE: apenas usuários autenticados podem deletar
DROP POLICY IF EXISTS "Authenticated users can delete appointments" ON appointments;
CREATE POLICY "Authenticated users can delete appointments"
  ON appointments
  FOR DELETE
  TO authenticated
  USING (true);

-- =====================================================================
-- VERIFICAÇÃO (execute para conferir que tudo foi aplicado)
-- =====================================================================
-- SELECT column_name, data_type, column_default
--   FROM information_schema.columns
--   WHERE table_name = 'appointments'
--   ORDER BY ordinal_position;
--
-- SELECT policyname, cmd, roles FROM pg_policies WHERE tablename = 'appointments';
