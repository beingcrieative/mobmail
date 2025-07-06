import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';
import { z } from 'zod';

// Validation schema for contact form
const contactFormSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  company: z.string().optional(),
  message: z.string().min(1, 'Message is required')
});

export async function POST(request: Request) {
  try {
    // Parse the request body
    const body = await request.json();
    
    // Validate the form data
    const result = contactFormSchema.safeParse(body);
    
    if (!result.success) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Validation failed', 
          details: result.error.format() 
        }, 
        { status: 400 }
      );
    }
    
    const validatedData = result.data;
    
    const supabase = getSupabaseAdmin();
    if (!supabase) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Database is currently unavailable'
        }, 
        { status: 503 }
      );
    }
    
    // Insert the submission into Supabase
    const { data, error } = await supabase
      .from('contact_form')
      .insert([
        {
          name: validatedData.name,
          email: validatedData.email,
          phone: validatedData.phone || null,
          company: validatedData.company || null,
          message: validatedData.message,
          status: 'new'
        }
      ])
      .select();
    
    if (error) {
      console.error('Error saving contact form:', error);
      return NextResponse.json(
        { 
          success: false, 
          error: 'Failed to save contact form',
          details: error.message
        }, 
        { status: 500 }
      );
    }
    
    // Successfully saved the contact submission
    return NextResponse.json({
      success: true,
      message: 'Contact form saved successfully',
      submission_id: data[0].id
    });
    
  } catch (error: any) {
    console.error('Unexpected error in contact API:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'An unexpected error occurred',
        details: error.message 
      }, 
      { status: 500 }
    );
  }
} 