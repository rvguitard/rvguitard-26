-- rls.sql
-- Row-Level Security policies for public anonymous client usage.
-- You will still use your service_role key for admin tasks (approve/remove wall items).

-- Enable RLS
ALTER TABLE IF EXISTS public.wall_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.chat_messages ENABLE ROW LEVEL SECURITY;

-- WALL POLICIES
-- 1) Allow anyone to SELECT only approved items
CREATE POLICY "wall_select_approved" ON public.wall_items
  FOR SELECT
  USING (status = 'approved');

-- 2) Allow anonymous INSERT but force status='pending' and content checks
CREATE POLICY "wall_insert_pending" ON public.wall_items
  FOR INSERT
  WITH CHECK (
    status = 'pending'
    AND char_length(content) BETWEEN 1 AND 1000
    AND content NOT LIKE '%<%' AND content NOT LIKE '%>%'
  );

-- No client UPDATE/DELETE policies provided: require server/service_role to modify.

-- CHAT POLICIES
-- 1) Allow anyone to SELECT chat messages (public)
CREATE POLICY "chat_select_public" ON public.chat_messages
  FOR SELECT
  USING (true);

-- 2) Allow anyone to INSERT messages with content checks and a max length
CREATE POLICY "chat_insert_public" ON public.chat_messages
  FOR INSERT
  WITH CHECK (
    char_length(content) BETWEEN 1 AND 500
    AND content NOT LIKE '%<%' AND content NOT LIKE '%>%'
  );

-- Again, updates/deletes should be done server-side by an admin using the service_role key.
