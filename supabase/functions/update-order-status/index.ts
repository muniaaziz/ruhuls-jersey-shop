
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.8'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  // Handle OPTIONS request for CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Get request body
    const { orderId, status, notes } = await req.json()
    
    // Validate input
    if (!orderId || !status) {
      return new Response(
        JSON.stringify({ error: 'Order ID and status are required' }),
        { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      )
    }

    // Create a Supabase client with the Auth context of the logged in user
    const supabaseUrl = Deno.env.get('SUPABASE_URL') as string
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') as string
    const supabaseClient = createClient(supabaseUrl, supabaseAnonKey)

    // Get Auth token from request
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'No authorization header' }),
        { status: 401, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      )
    }
    
    supabaseClient.auth.setAuth(authHeader.replace('Bearer ', ''))

    // Update order status
    const { error: orderError } = await supabaseClient
      .from('orders')
      .update({ 
        status, 
        updated_at: new Date().toISOString() 
      })
      .eq('id', orderId)

    if (orderError) throw orderError

    // Insert status update record
    const { data: statusUpdate, error: statusError } = await supabaseClient
      .from('status_updates')
      .insert({
        order_id: orderId,
        status,
        notes: notes || `Status updated to ${status}`
      })
      .select()
      .single()

    if (statusError) throw statusError
    
    return new Response(
      JSON.stringify({ success: true, data: statusUpdate }),
      { status: 200, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    )
  }
})
