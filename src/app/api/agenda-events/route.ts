import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();
    
    // Fetch events for the user
    const { data: events, error } = await supabase
      .from('agenda_events')
      .select('*')
      .eq('user_id', userId)
      .is('deleted_at', null)
      .order('start_time', { ascending: true });

    if (error) {
      console.error('Error fetching agenda events:', error);
      return NextResponse.json({ error: 'Failed to fetch events' }, { status: 500 });
    }

    return NextResponse.json({ events: events || [] });
  } catch (error) {
    console.error('Error in GET /api/agenda-events:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      title,
      description,
      startTime,
      endTime,
      location,
      attendees,
      allDay,
      priority,
      color,
      reminderMinutes,
      recurrenceType,
      userId
    } = body;

    if (!title || !startTime || !endTime || !userId) {
      return NextResponse.json(
        { error: 'title, startTime, endTime, and userId are required' },
        { status: 400 }
      );
    }

    const supabase = getSupabaseAdmin();

    // Create new event
    const { data: event, error } = await supabase
      .from('agenda_events')
      .insert({
        title,
        description: description || null,
        start_time: startTime,
        end_time: endTime,
        location: location || null,
        attendees: attendees || null,
        all_day: allDay || false,
        priority: priority || 'medium',
        color: color || 'blue',
        status: 'confirmed',
        reminder_minutes: reminderMinutes || 15,
        recurrence_type: recurrenceType || 'none',
        user_id: userId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating agenda event:', error);
      return NextResponse.json({ error: 'Failed to create event' }, { status: 500 });
    }

    return NextResponse.json({ event });
  } catch (error) {
    console.error('Error in POST /api/agenda-events:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      id,
      title,
      description,
      startTime,
      endTime,
      location,
      attendees,
      allDay,
      priority,
      color,
      reminderMinutes,
      recurrenceType,
      userId
    } = body;

    if (!id || !userId) {
      return NextResponse.json(
        { error: 'id and userId are required' },
        { status: 400 }
      );
    }

    const supabase = getSupabaseAdmin();

    // Update event (only if it belongs to the user)
    const { data: event, error } = await supabase
      .from('agenda_events')
      .update({
        title,
        description,
        start_time: startTime,
        end_time: endTime,
        location,
        attendees,
        all_day: allDay,
        priority,
        color,
        reminder_minutes: reminderMinutes,
        recurrence_type: recurrenceType,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      console.error('Error updating agenda event:', error);
      return NextResponse.json({ error: 'Failed to update event' }, { status: 500 });
    }

    if (!event) {
      return NextResponse.json({ error: 'Event not found or unauthorized' }, { status: 404 });
    }

    return NextResponse.json({ event });
  } catch (error) {
    console.error('Error in PUT /api/agenda-events:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const userId = searchParams.get('userId');

    if (!id || !userId) {
      return NextResponse.json(
        { error: 'id and userId are required' },
        { status: 400 }
      );
    }

    const supabase = getSupabaseAdmin();

    // Soft delete the event (only if it belongs to the user)
    const { data: event, error } = await supabase
      .from('agenda_events')
      .update({
        deleted_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      console.error('Error deleting agenda event:', error);
      return NextResponse.json({ error: 'Failed to delete event' }, { status: 500 });
    }

    if (!event) {
      return NextResponse.json({ error: 'Event not found or unauthorized' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in DELETE /api/agenda-events:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}