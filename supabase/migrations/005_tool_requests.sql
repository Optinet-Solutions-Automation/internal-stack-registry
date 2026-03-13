-- Tool Requests table
CREATE TABLE tool_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tool_name TEXT NOT NULL,
  category TEXT,
  vendor TEXT,
  justification TEXT,
  requested_by TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  reviewed_by TEXT,
  review_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Auto-update updated_at
CREATE TRIGGER set_tool_requests_updated_at
  BEFORE UPDATE ON tool_requests
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- RLS
ALTER TABLE tool_requests ENABLE ROW LEVEL SECURITY;

-- Anyone authenticated can insert and read their own + all (admins review)
CREATE POLICY "Authenticated users can insert tool requests"
  ON tool_requests FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can read all tool requests"
  ON tool_requests FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can update tool requests"
  ON tool_requests FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Authenticated users can delete tool requests"
  ON tool_requests FOR DELETE TO authenticated USING (true);
