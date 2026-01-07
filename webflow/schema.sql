-- schema.sql
-- Minimal schema for wall and chat with constraints + indexes.
-- Uses pgcrypto for gen_random_uuid()

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- WALL ITEMS
CREATE TABLE IF NOT EXISTS public.wall_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  content text NOT NULL CHECK (char_length(content) BETWEEN 1 AND 1000),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','removed')),
  -- Basic content safety: disallow angle-brackets to reduce HTML injection risk
  CHECK (content NOT LIKE '%<%' AND content NOT LIKE '%>%')
);

CREATE INDEX IF NOT EXISTS wall_items_created_idx ON public.wall_items (created_at DESC);
CREATE INDEX IF NOT EXISTS wall_items_status_idx ON public.wall_items (status);

-- CHAT MESSAGES
CREATE TABLE IF NOT EXISTS public.chat_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  room_id text NOT NULL DEFAULT 'lobby',
  content text NOT NULL CHECK (char_length(content) BETWEEN 1 AND 500),
  CHECK (content NOT LIKE '%<%' AND content NOT LIKE '%>%')
);

CREATE INDEX IF NOT EXISTS chat_messages_room_created_idx ON public.chat_messages (room_id, created_at DESC);

-- SIMPLE GLOBAL RATE-LIMIT TRIGGERS
-- These are coarse safeguards: they limit global inserts per minute.
-- Adjust thresholds as you see fit.

-- Wall: max 10 inserts per minute total
CREATE OR REPLACE FUNCTION public.wall_rate_limit() RETURNS trigger LANGUAGE plpgsql AS $$
DECLARE
  recent_count int;
BEGIN
  SELECT count(*) INTO recent_count FROM public.wall_items WHERE created_at > now() - interval '1 minute';
  IF recent_count >= 10 THEN
    RAISE EXCEPTION 'Rate limit: too many wall submissions, try again later';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS wall_rate_limit_trigger ON public.wall_items;
CREATE TRIGGER wall_rate_limit_trigger
BEFORE INSERT ON public.wall_items
FOR EACH ROW
EXECUTE FUNCTION public.wall_rate_limit();

-- Chat: max 100 inserts per minute total
CREATE OR REPLACE FUNCTION public.chat_rate_limit() RETURNS trigger LANGUAGE plpgsql AS $$
DECLARE
  recent_count int;
BEGIN
  SELECT count(*) INTO recent_count FROM public.chat_messages WHERE created_at > now() - interval '1 minute';
  IF recent_count >= 100 THEN
    RAISE EXCEPTION 'Rate limit: chat is busy, try again later';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS chat_rate_limit_trigger ON public.chat_messages;
CREATE TRIGGER chat_rate_limit_trigger
BEFORE INSERT ON public.chat_messages
FOR EACH ROW
EXECUTE FUNCTION public.chat_rate_limit();
