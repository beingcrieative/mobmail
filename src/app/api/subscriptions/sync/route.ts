import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';
import { getStripe } from '@/lib/stripe';

export async function POST(request: Request) {
  try {
    console.log('Starting subscription sync...');
    
    const stripe = getStripe();
    if (!stripe) {
      return NextResponse.json(
        { error: 'Payment processing is currently unavailable' },
        { status: 503 }
      );
    }

    const supabase = getSupabaseAdmin();
    if (!supabase) {
      return NextResponse.json(
        { error: 'Database is currently unavailable' },
        { status: 503 }
      );
    }
    
    // Get all active subscriptions from Stripe
    const stripeSubs = await stripe.subscriptions.list({
      status: 'active',
      expand: ['data.customer']
    });

    console.log(`Found ${stripeSubs.data.length} active subscriptions in Stripe`);
    
    // Log details of each subscription
    for (const sub of stripeSubs.data) {
      console.log('Stripe subscription:', {
        id: sub.id,
        customer: typeof sub.customer === 'string' ? sub.customer : sub.customer.id,
        metadata: sub.metadata,
        status: sub.status,
        items: sub.items.data.map(item => ({
          price: item.price.id,
          quantity: item.quantity
        }))
      });
      
      // Get user ID from metadata (check both formats)
      const userId = sub.metadata?.user_id || sub.metadata?.userId;
      
      if (userId) {
        // For development purposes, insert a test subscription
        const isDevelopment = process.env.NODE_ENV !== 'production';
        
        if (isDevelopment) {
          try {
            console.log(`Trying to insert test subscription for user ${userId}`);
            
            const { data, error } = await supabase
              .from('subscriptions')
              .upsert({
                user_id: userId,
                plan_id: sub.metadata?.plan_id || 'basic-monthly',
                status: sub.status,
                current_period_start: new Date(sub.current_period_start * 1000).toISOString(),
                current_period_end: new Date(sub.current_period_end * 1000).toISOString()
              })
              .select();
              
            if (error) {
              console.error('Error inserting test subscription:', error);
            } else {
              console.log(`Successfully inserted test subscription:`, data);
            }
          } catch (e) {
            console.error('Exception inserting test subscription:', e);
          }
        }
      }
    }

    // Get all subscriptions from database
    const { data: dbSubs, error: dbError } = await supabase
      .from('subscriptions')
      .select('*');

    if (dbError) {
      console.error('Error fetching database subscriptions:', dbError);
      return NextResponse.json(
        { error: 'Failed to fetch database subscriptions' },
        { status: 500 }
      );
    }

    console.log(`Found ${dbSubs.length} subscriptions in database`);

    // Create maps for easier comparison
    const stripeMap = new Map(
      stripeSubs.data.map((sub: any) => [sub.id, sub])
    );
    const dbMap = new Map(
      dbSubs.map((sub: any) => [sub.id, sub])
    );

    const updates: any[] = [];
    const inserts: any[] = [];
    const deactivations: any[] = [];

    // Check for updates and new subscriptions
    for (const [stripeId, stripeSub] of stripeMap) {
      // Get user ID from metadata (check both formats)
      const stripeUserId = stripeSub.metadata?.user_id || stripeSub.metadata?.userId;
      const customerId = typeof stripeSub.customer === 'string' ? stripeSub.customer : stripeSub.customer.id;
      
      if (!stripeUserId) {
        console.warn(`No user_id in metadata for subscription ${stripeId}. Metadata:`, stripeSub.metadata);
        
        // Try to get the user_id from the customer's metadata
        try {
          const customer = await stripe.customers.retrieve(customerId) as any;
          const customerUserId = customer.metadata?.user_id || customer.metadata?.userId;
          
          if (customerUserId) {
            console.log(`Found user_id ${customerUserId} in customer metadata. Updating subscription...`);
            
            // Update the subscription's metadata
            await stripe.subscriptions.update(stripeId, {
              metadata: {
                ...stripeSub.metadata,
                user_id: customerUserId
              }
            });
            
            // Update local reference
            stripeSub.metadata = {
              ...stripeSub.metadata,
              user_id: customerUserId
            };
          } else {
            console.warn(`Could not find user_id in customer metadata for ${stripeId}`);
            continue;
          }
        } catch (error) {
          console.error(`Error retrieving customer for subscription ${stripeId}:`, error);
          continue;
        }
      }
      
      // By this point we should have a stripeUserId either from subscription or customer metadata
      const finalUserId = stripeSub.metadata?.user_id || stripeSub.metadata?.userId;
      if (!finalUserId) {
        console.warn(`Still no user_id for subscription ${stripeId} after recovery attempts`);
        continue;
      }
      
      // For development testing purposes, allow test user IDs
      const isDevelopment = process.env.NODE_ENV !== 'production';
      const isTestUser = finalUserId.includes('test-');
      let userData = null;
      
      if (isDevelopment && isTestUser) {
        console.log(`Development mode: Using test user ID ${finalUserId}`);
        userData = { id: finalUserId };
      } else {
        // Verify user exists in the auth.users table
        const { data: userQueryData, error: userError } = await supabase
          .from('users')
          .select('id, email')
          .eq('id', finalUserId)
          .single();

        if (userError || !userQueryData) {
          console.warn(`User ${finalUserId} not found in users table for subscription ${stripeId}`);
          // Try to find user by email as fallback
          if (stripeSub.metadata?.email) {
            const { data: userByEmail, error: emailError } = await supabase
              .from('users')
              .select('id')
              .eq('email', stripeSub.metadata.email)
              .single();

            if (emailError || !userByEmail) {
              console.warn(`Could not find user by email for subscription ${stripeId}`);
              
              if (isDevelopment) {
                console.log(`Development mode: Creating mock data for test subscription ${stripeId}`);
                userData = { id: finalUserId };
              } else {
                continue;
              }
            } else {
              // Found user by email, use that ID
              console.log(`Found user by email for subscription ${stripeId}. Using ID: ${userByEmail.id}`);
              
              // Update Stripe subscription with correct user ID
              try {
                await stripe.subscriptions.update(stripeId, {
                  metadata: {
                    ...stripeSub.metadata,
                    user_id: userByEmail.id
                  }
                });
                console.log(`Updated Stripe subscription ${stripeId} with correct user ID: ${userByEmail.id}`);
              } catch (error) {
                console.error(`Failed to update Stripe subscription ${stripeId} with user ID:`, error);
              }
              
              // Update local reference
              stripeSub.metadata = {
                ...stripeSub.metadata,
                user_id: userByEmail.id
              };
              
              userData = userByEmail;
            }
          } else {
            if (isDevelopment) {
              console.log(`Development mode: Using test user ID ${finalUserId} despite not finding in database`);
              userData = { id: finalUserId };
            } else {
              continue;
            }
          }
        } else {
          userData = userQueryData;
        }
      }
      
      if (!userData) {
        console.warn(`No valid user data for subscription ${stripeId}, skipping`);
        continue;
      }
      
      const dbSub = dbMap.get(stripeId) as any;
      
      if (!dbSub) {
        // New subscription in Stripe - only use basic fields available in current schema
        const subscriptionData = {
          user_id: userData.id,
          plan_id: stripeSub.metadata?.plan_id || 'basic-monthly',
          status: stripeSub.status,
          current_period_start: new Date(stripeSub.current_period_start * 1000).toISOString(),
          current_period_end: new Date(stripeSub.current_period_end * 1000).toISOString()
        };

        console.log('Inserting subscription:', subscriptionData);
        inserts.push(subscriptionData);
      } else if (
        dbSub.status !== stripeSub.status ||
        new Date(dbSub.current_period_end) < new Date(stripeSub.current_period_end * 1000)
      ) {
        // Subscription needs update
        const updateData = {
          id: dbSub.id,
          status: stripeSub.status,
          current_period_start: new Date(stripeSub.current_period_start * 1000).toISOString(),
          current_period_end: new Date(stripeSub.current_period_end * 1000).toISOString()
        };

        console.log('Updating subscription:', updateData);
        updates.push(updateData);
      }
    }

    // Check for subscriptions that should be deactivated
    for (const [dbStripeId, dbSub] of dbMap) {
      const dbSubTyped = dbSub as any;
      if (!stripeMap.has(dbStripeId) && dbSubTyped.status === 'active') {
        // Subscription exists in DB but not in Stripe (or not active in Stripe)
        deactivations.push({
          id: dbSubTyped.id,
          status: 'canceled',
          updated_at: new Date().toISOString()
        });
      }
    }

    // Perform database updates
    if (inserts.length > 0) {
      const { error: insertError } = await supabase
        .from('subscriptions')
        .insert(inserts);

      if (insertError) {
        console.error('Error inserting new subscriptions:', insertError);
        return NextResponse.json(
          { error: 'Failed to insert subscriptions', details: insertError },
          { status: 500 }
        );
      } else {
        console.log(`Inserted ${inserts.length} new subscriptions`);
      }
    }

    if (updates.length > 0) {
      for (const update of updates) {
        const { error: updateError } = await supabase
          .from('subscriptions')
          .update(update)
          .eq('id', update.id);

        if (updateError) {
          console.error('Error updating subscription:', updateError);
          return NextResponse.json(
            { error: 'Failed to update subscription', details: updateError },
            { status: 500 }
          );
        }
      }
      console.log(`Updated ${updates.length} subscriptions`);
    }

    if (deactivations.length > 0) {
      for (const deactivation of deactivations) {
        const { error: deactivationError } = await supabase
          .from('subscriptions')
          .update(deactivation)
          .eq('id', deactivation.id);

        if (deactivationError) {
          console.error('Error deactivating subscription:', deactivationError);
          return NextResponse.json(
            { error: 'Failed to deactivate subscription', details: deactivationError },
            { status: 500 }
          );
        }
      }
      console.log(`Deactivated ${deactivations.length} subscriptions`);
    }

    return NextResponse.json({
      success: true,
      summary: {
        total_stripe: stripeSubs.data.length,
        total_db: dbSubs.length,
        inserted: inserts.length,
        updated: updates.length,
        deactivated: deactivations.length,
      }
    });

  } catch (error) {
    console.error('Error in subscription sync:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error },
      { status: 500 }
    );
  }
} 