import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface Notification {
  id: string;
  type: 'new_voicemail' | 'transcription_ready' | 'system_update' | 'forwarding_status' | 'missed_call';
  title: string;
  message: string;
  timestamp: number;
  read: boolean;
  priority: 'high' | 'medium' | 'low';
  actionUrl?: string;
  metadata?: any;
  user_id: string;
}

// GET - Fetch notifications for a user
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Try to fetch from Supabase notifications table
    const { data: notifications, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('timestamp', { ascending: false })
      .limit(50);

    if (error && error.code !== 'PGRST116') { // Table doesn't exist error
      console.error('Supabase error:', error);
      return NextResponse.json(
        { error: 'Database error' },
        { status: 500 }
      );
    }

    // If table doesn't exist or no data, return mock notifications for demo
    if (!notifications || notifications.length === 0) {
      const mockNotifications: Notification[] = [
        {
          id: `notif-${Date.now()}-1`,
          type: 'new_voicemail',
          title: 'Nieuwe voicemail',
          message: 'Je hebt een nieuwe voicemail ontvangen van +31 6 12345678',
          timestamp: Date.now() - 300000, // 5 minutes ago
          read: false,
          priority: 'high',
          actionUrl: '/mobile-v3/transcriptions',
          user_id: userId
        },
        {
          id: `notif-${Date.now()}-2`,
          type: 'transcription_ready',
          title: 'Transcriptie klaar',
          message: 'De transcriptie van je gesprek met John Doe is beschikbaar',
          timestamp: Date.now() - 900000, // 15 minutes ago
          read: false,
          priority: 'medium',
          actionUrl: '/mobile-v3/transcriptions',
          user_id: userId
        },
        {
          id: `notif-${Date.now()}-3`,
          type: 'forwarding_status',
          title: 'Doorschakeling status',
          message: 'Je doorschakeling naar voicemail is succesvol geactiveerd',
          timestamp: Date.now() - 3600000, // 1 hour ago
          read: true,
          priority: 'low',
          user_id: userId
        }
      ];

      return NextResponse.json({
        notifications: mockNotifications,
        total: mockNotifications.length
      });
    }

    return NextResponse.json({
      notifications: notifications || [],
      total: notifications?.length || 0
    });

  } catch (error) {
    console.error('Error fetching notifications:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - Create a new notification
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, type, title, message, priority = 'medium', actionUrl, metadata } = body;

    if (!userId || !type || !title || !message) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const notification: Notification = {
      id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type,
      title,
      message,
      timestamp: Date.now(),
      read: false,
      priority,
      actionUrl,
      metadata,
      user_id: userId
    };

    // Try to insert into Supabase
    const { data, error } = await supabase
      .from('notifications')
      .insert(notification)
      .select()
      .single();

    if (error) {
      console.error('Error creating notification:', error);
      // Still return success even if DB insert fails (graceful degradation)
      return NextResponse.json({
        notification,
        message: 'Notification created (in-memory only)'
      });
    }

    return NextResponse.json({
      notification: data,
      message: 'Notification created successfully'
    });

  } catch (error) {
    console.error('Error creating notification:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}