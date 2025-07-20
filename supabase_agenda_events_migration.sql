-- Agenda Events Table for VoicemailAI Calendar Feature
-- Run this migration in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS agenda_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  location TEXT,
  attendees TEXT,
  all_day BOOLEAN DEFAULT FALSE,
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  color TEXT DEFAULT 'blue',
  status TEXT DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'tentative', 'cancelled')),
  reminder_minutes INTEGER DEFAULT 15,
  recurrence_type TEXT DEFAULT 'none' CHECK (recurrence_type IN ('none', 'daily', 'weekly', 'monthly', 'yearly')),
  deleted_at TIMESTAMPTZ DEFAULT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_agenda_events_user_id ON agenda_events(user_id);
CREATE INDEX IF NOT EXISTS idx_agenda_events_start_time ON agenda_events(start_time);
CREATE INDEX IF NOT EXISTS idx_agenda_events_deleted_at ON agenda_events(deleted_at);

-- Enable Row Level Security (RLS)
ALTER TABLE agenda_events ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for user isolation
CREATE POLICY "Users can view own events" ON agenda_events
  FOR SELECT USING (user_id = auth.uid()::text);

CREATE POLICY "Users can insert own events" ON agenda_events
  FOR INSERT WITH CHECK (user_id = auth.uid()::text);

CREATE POLICY "Users can update own events" ON agenda_events
  FOR UPDATE USING (user_id = auth.uid()::text);

CREATE POLICY "Users can delete own events" ON agenda_events
  FOR DELETE USING (user_id = auth.uid()::text);

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_agenda_events_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic updated_at
CREATE TRIGGER update_agenda_events_updated_at
  BEFORE UPDATE ON agenda_events
  FOR EACH ROW
  EXECUTE FUNCTION update_agenda_events_updated_at();

-- Insert some example data for testing (optional)
-- Uncomment the following lines if you want test data:

/*
INSERT INTO agenda_events (user_id, title, description, start_time, end_time, location, priority, color) VALUES
('user-123', 'Test Meeting', 'Een test afspraak', '2025-01-20 10:00:00+00', '2025-01-20 11:00:00+00', 'Online', 'medium', 'blue'),
('user-123', 'Belangrijke Call', 'Belangrijke klant gesprek', '2025-01-21 14:30:00+00', '2025-01-21 15:30:00+00', 'Kantoor', 'high', 'red'),
('user-123', 'Project Review', 'Weekelijkse project bespreking', '2025-01-22 09:00:00+00', '2025-01-22 10:00:00+00', 'Teams', 'medium', 'green');
*/

-- Verify table creation
SELECT 'agenda_events table created successfully' AS status;