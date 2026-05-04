-- Migration 005: Index on appointments.motorista_id FK
-- The FK column had no index — any filter or JOIN on motorista_id caused a full table scan.
-- Apply via Supabase Dashboard → SQL Editor

CREATE INDEX IF NOT EXISTS idx_appointments_motorista_id
  ON appointments (motorista_id);
