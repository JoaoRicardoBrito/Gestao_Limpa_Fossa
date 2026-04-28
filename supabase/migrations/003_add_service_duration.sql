-- 003_add_service_duration.sql
-- Records when a service actually starts (em_andamento) to measure real execution time.
-- Dashboard uses (concluido_em - em_andamento_em) to compute average service duration.
-- Existing rows remain NULL and are excluded from the average calculation.

ALTER TABLE appointments ADD COLUMN IF NOT EXISTS em_andamento_em timestamptz;

CREATE INDEX IF NOT EXISTS idx_appointments_em_andamento_em
  ON appointments (em_andamento_em);
