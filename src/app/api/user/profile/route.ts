import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { createClient } from '@supabase/supabase-js';

interface UserProfile {
  id: string;
  name: string;
  companyName: string;
  mobileNumber: string;
  information: string;
  calUsername: string;
  calApiKey: string;
  calEventTypeId: string;
  created_at?: string;
  updated_at?: string;
}

export async function GET(request: NextRequest) {
  try {
    // Get the user ID from the cookie
    const userId = request.cookies.get('userId')?.value;
    
    if (!userId) {
      console.error('No user ID found in cookies');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    console.log('Fetching profile for user:', userId);
    
    // Get profile from database
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        console.log('Profile not found, returning default profile');
        return NextResponse.json({
          name: '',
          companyName: '',
          mobileNumber: '',
          information: '',
          calUsername: '',
          calApiKey: '',
          calEventTypeId: '',
        });
      }
      
      console.error('Error fetching user profile:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    if (!profile) {
      console.log('Profile not found, returning default profile');
      return NextResponse.json({
        name: '',
        companyName: '',
        mobileNumber: '',
        information: '',
        calUsername: '',
        calApiKey: '',
        calEventTypeId: '',
      });
    }
    
    console.log('Profile found, returning data');
    return NextResponse.json({
      name: profile.name || '',
      companyName: profile.company_name || '',
      mobileNumber: profile.mobile_number || '',
      information: profile.information || '',
      calUsername: profile.cal_username || '',
      calApiKey: profile.cal_api_key || '',
      calEventTypeId: profile.cal_event_type_id || '',
    });
    
  } catch (error: any) {
    console.error('Error fetching user profile:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    // Get the user ID from the cookie
    const userId = request.cookies.get('userId')?.value;
    
    if (!userId) {
      console.error('No user ID found in cookies');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    console.log('Updating profile for user:', userId);
    
    const { name, companyName, mobileNumber, information, calUsername, calApiKey, calEventTypeId } = await request.json();
    
    // Check if profile exists
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    
    let result;
    
    if (existingProfile) {
      console.log('Profile exists, updating profile');
      
      // Update existing profile using the original function
      result = await supabase.rpc('update_profile', {
        p_id: userId,
        p_name: name || '',
        p_company_name: companyName || '',
        p_mobile_number: mobileNumber || '',
        p_information: information || ''
      });

      // Update Cal.com fields separately
      if (result && !result.error) {
        result = await supabase
          .from('profiles')
          .update({
            cal_username: calUsername || '',
            cal_api_key: calApiKey || '',
            cal_event_type_id: calEventTypeId || ''
          })
          .eq('id', userId);
      }
    } else {
      console.log('Profile does not exist, creating new profile');
      
      // Create new profile using the original function
      result = await supabase.rpc('insert_profile', {
        p_id: userId,
        p_name: name || '',
        p_company_name: companyName || '',
        p_mobile_number: mobileNumber || '',
        p_information: information || ''
      });

      // Add Cal.com fields after profile creation
      if (result && !result.error) {
        result = await supabase
          .from('profiles')
          .update({
            cal_username: calUsername || '',
            cal_api_key: calApiKey || '',
            cal_event_type_id: calEventTypeId || ''
          })
          .eq('id', userId);
      }
    }
    
    if (result.error) {
      console.error('Error updating user profile:', result.error);
      return NextResponse.json({ 
        error: result.error.message,
        details: result.error.details,
        hint: result.error.hint
      }, { status: 500 });
    }
    
    console.log('Profile updated successfully');
    return NextResponse.json({ success: true });
    
  } catch (error: any) {
    console.error('Error updating user profile:', error);
    return NextResponse.json({ 
      error: error.message,
      details: error.details,
      hint: error.hint
    }, { status: 500 });
  }
} 