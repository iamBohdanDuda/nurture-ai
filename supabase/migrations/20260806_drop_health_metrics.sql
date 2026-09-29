-- Migration: Drop health_metrics table
-- Date: 2026-08-06
-- Drops the legacy health_metrics table that was replaced by specialized tracking tables

DROP TABLE IF EXISTS public.health_metrics CASCADE;
