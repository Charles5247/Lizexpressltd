// Supabase Edge Function for Flutterwave webhook handling
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface FlutterwaveWebhookData {
  event: string;
  data: {
    id: number;
    tx_ref: string;
    flw_ref: string;
    device_fingerprint: string;
    amount: number;
    currency: string;
    charged_amount: number;
    app_fee: number;
    merchant_fee: number;
    processor_response: string;
    auth_model: string;
    card?: {
      first_6digits: string;
      last_4digits: string;
      issuer: string;
      country: string;
      type: string;
      token: string;
      expiry: string;
    };
    created_at: string;
    status: string;
    customer: {
      id: number;
      phone_number: string;
      name: string;
      email: string;
      created_at: string;
    };
    account?: {
      id: number;
      account_id: string;
      account_number: string;
      bank_code: string;
      bank_name: string;
    };
  };
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get webhook secret for verification
    const webhookSecret = Deno.env.get('FLUTTERWAVE_WEBHOOK_SECRET')
    
    // Parse webhook data
    const webhookData: FlutterwaveWebhookData = await req.json()
    
    console.log('Received webhook:', JSON.stringify(webhookData, null, 2))

    // Verify webhook (you can add signature verification here)
    // For now, we'll process all webhooks
    
    const { tx_ref, status, id, amount, currency } = webhookData.data

    // Check if this is a payment completion event
    if (webhookData.event === 'charge.completed' && status === 'successful') {
      
      // Find the payment record
      const { data: payment, error: paymentError } = await supabaseClient
        .from('payments')
        .select('*')
        .eq('tx_ref', tx_ref)
        .single()

      if (paymentError) {
        console.error('Payment not found:', paymentError)
        return new Response(
          JSON.stringify({ error: 'Payment not found' }),
          { 
            status: 404, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }

      // Update payment status
      const { error: updateError } = await supabaseClient
        .from('payments')
        .update({ 
          status: 'successful',
          flutterwave_transaction_id: id.toString(),
          updated_at: new Date().toISOString()
        })
        .eq('tx_ref', tx_ref)

      if (updateError) {
        console.error('Failed to update payment:', updateError)
        return new Response(
          JSON.stringify({ error: 'Failed to update payment' }),
          { 
            status: 500, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }

      // If this payment is for an item listing, activate the item
      if (payment.item_id) {
        const { error: itemError } = await supabaseClient
          .from('items')
          .update({ 
            status: 'active',
            payment_status: 'paid',
            updated_at: new Date().toISOString()
          })
          .eq('id', payment.item_id)

        if (itemError) {
          console.error('Failed to activate item:', itemError)
          // Don't fail the webhook, just log the error
        }
      }

      // Create a notification for the user
      const { error: notificationError } = await supabaseClient
        .from('notifications')
        .insert({
          user_id: payment.user_id,
          type: 'payment_success',
          title: 'Payment Successful',
          message: `Your listing payment of ₦${amount.toLocaleString()} has been processed successfully.`,
          data: {
            payment_id: payment.id,
            amount: amount,
            currency: currency
          }
        })

      if (notificationError) {
        console.error('Failed to create notification:', notificationError)
        // Don't fail the webhook, just log the error
      }

      console.log('Payment processed successfully:', tx_ref)
      
      return new Response(
        JSON.stringify({ success: true, message: 'Payment processed successfully' }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Handle failed payments
    if (webhookData.event === 'charge.completed' && status === 'failed') {
      const { error: updateError } = await supabaseClient
        .from('payments')
        .update({ 
          status: 'failed',
          updated_at: new Date().toISOString()
        })
        .eq('tx_ref', tx_ref)

      if (updateError) {
        console.error('Failed to update payment status:', updateError)
      }

      return new Response(
        JSON.stringify({ success: true, message: 'Payment failure recorded' }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // For other events, just acknowledge receipt
    return new Response(
      JSON.stringify({ success: true, message: 'Webhook received' }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Webhook processing error:', error)
    
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})
