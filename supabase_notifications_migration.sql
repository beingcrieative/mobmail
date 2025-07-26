-- Create notifications table for real-time notification system
CREATE TABLE IF NOT EXISTS notifications (
  id VARCHAR(255) PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,
  type VARCHAR(50) NOT NULL CHECK (type IN ('new_voicemail', 'transcription_ready', 'system_update', 'forwarding_status', 'missed_call')),
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  timestamp BIGINT NOT NULL,
  read BOOLEAN DEFAULT FALSE,
  priority VARCHAR(10) DEFAULT 'medium' CHECK (priority IN ('high', 'medium', 'low')),
  action_url VARCHAR(500),
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_timestamp ON notifications(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);
CREATE INDEX IF NOT EXISTS idx_notifications_priority ON notifications(priority);

-- Enable RLS (Row Level Security)
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own notifications" ON notifications
  FOR SELECT USING (user_id = current_setting('request.jwt.claims', true)::json->>'sub');

CREATE POLICY "Users can insert their own notifications" ON notifications
  FOR INSERT WITH CHECK (user_id = current_setting('request.jwt.claims', true)::json->>'sub');

CREATE POLICY "Users can update their own notifications" ON notifications
  FOR UPDATE USING (user_id = current_setting('request.jwt.claims', true)::json->>'sub');

CREATE POLICY "Users can delete their own notifications" ON notifications
  FOR DELETE USING (user_id = current_setting('request.jwt.claims', true)::json->>'sub');

-- Create function to automatically update timestamp
CREATE OR REPLACE FUNCTION update_notifications_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for auto-updating timestamp
CREATE TRIGGER trigger_update_notifications_timestamp
  BEFORE UPDATE ON notifications
  FOR EACH ROW
  EXECUTE FUNCTION update_notifications_updated_at();

-- Insert sample notifications for testing (optional)
INSERT INTO notifications (id, user_id, type, title, message, timestamp, read, priority, action_url) VALUES
('notif-sample-1', 'demo-user-id', 'new_voicemail', 'Nieuwe voicemail', 'Je hebt een nieuwe voicemail ontvangen van +31 6 12345678', EXTRACT(EPOCH FROM NOW() - INTERVAL '5 minutes') * 1000, false, 'high', '/mobile-v3/transcriptions'),
('notif-sample-2', 'demo-user-id', 'transcription_ready', 'Transcriptie klaar', 'De transcriptie van je gesprek met John Doe is beschikbaar', EXTRACT(EPOCH FROM NOW() - INTERVAL '15 minutes') * 1000, false, 'medium', '/mobile-v3/transcriptions'),
('notif-sample-3', 'demo-user-id', 'forwarding_status', 'Doorschakeling status', 'Je doorschakeling naar voicemail is succesvol geactiveerd', EXTRACT(EPOCH FROM NOW() - INTERVAL '1 hour') * 1000, true, 'low', null)
ON CONFLICT (id) DO NOTHING;

-- Add comments for documentation
COMMENT ON TABLE notifications IS 'Stores user notifications for real-time notification system';
COMMENT ON COLUMN notifications.id IS 'Unique notification identifier';
COMMENT ON COLUMN notifications.user_id IS 'User who owns this notification';
COMMENT ON COLUMN notifications.type IS 'Type of notification (new_voicemail, transcription_ready, etc.)';
COMMENT ON COLUMN notifications.title IS 'Notification title/heading';
COMMENT ON COLUMN notifications.message IS 'Notification message/body';
COMMENT ON COLUMN notifications.timestamp IS 'Unix timestamp when notification was created (milliseconds)';
COMMENT ON COLUMN notifications.read IS 'Whether the notification has been read by the user';
COMMENT ON COLUMN notifications.priority IS 'Notification priority level (high, medium, low)';
COMMENT ON COLUMN notifications.action_url IS 'Optional URL to navigate to when notification is clicked';
COMMENT ON COLUMN notifications.metadata IS 'Additional JSON metadata for the notification';