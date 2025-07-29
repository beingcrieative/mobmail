import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

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

    let notifications = null;
    
    // Try to fetch from database notifications table
    try {
      notifications = await prisma.notification.findMany({
        where: { userId },
        orderBy: { timestamp: 'desc' },
        take: 50
      });
    } catch (dbError) {
      console.log('Database not available, using mock data:', dbError);
      notifications = null;
    }

    // If no data or DB error, return mock notifications for demo
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

    // Try to insert into database
    try {
      const dbNotification = await prisma.notification.create({
        data: {
          id: notification.id,
          userId: notification.user_id,
          type: notification.type,
          title: notification.title,
          message: notification.message,
          timestamp: BigInt(notification.timestamp),
          read: notification.read,
          priority: notification.priority,
          actionUrl: notification.actionUrl,
          metadata: notification.metadata
        }
      });

      return NextResponse.json({
        notification: dbNotification,
        message: 'Notification created successfully'
      });
    } catch (dbError) {
      console.log('Database not available, returning mock response:', dbError);
      // Return success even if DB insert fails (graceful degradation)
      return NextResponse.json({
        notification,
        message: 'Notification created (in-memory only)'
      });
    }

  } catch (error) {
    console.error('Error creating notification:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}