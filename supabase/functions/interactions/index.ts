import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/utils.ts';

// Initialize Supabase client
const supabaseAdmin = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

/**
 * Interaction Management API Endpoints
 * Provides REST-like endpoints for mobile-optimized interaction tracking
 */
serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const pathSegments = url.pathname.split('/').filter(Boolean);
    
    // Extract interaction ID if present in path
    const interactionId = pathSegments[pathSegments.length - 1];
    const isSpecificInteraction = /^\d+$/.test(interactionId);
    
    // Get authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Verify JWT token and get user
    const jwt = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(jwt);
    
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid or expired token' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Route handlers based on HTTP method and path
    switch (req.method) {
      case 'GET':
        if (url.pathname.includes('/timeline')) {
          return await getInteractionTimeline(req, url, user);
        } else if (url.pathname.includes('/follow-ups')) {
          return await getFollowUpReminders(req, url, user);
        } else if (isSpecificInteraction) {
          return await getInteraction(req, url, user, interactionId);
        } else {
          return await getInteractions(req, url, user);
        }

      case 'POST':
        if (url.pathname.includes('/complete')) {
          return await completeInteraction(req, url, user, interactionId);
        } else if (url.pathname.includes('/schedule-follow-up')) {
          return await scheduleFollowUp(req, url, user, interactionId);
        } else if (url.pathname.includes('/add-location')) {
          return await addLocationToInteraction(req, url, user, interactionId);
        } else {
          return await createInteraction(req, url, user);
        }

      case 'PUT':
        if (isSpecificInteraction) {
          return await updateInteraction(req, url, user, interactionId);
        }
        break;

      case 'DELETE':
        if (isSpecificInteraction) {
          return await deleteInteraction(req, url, user, interactionId);
        }
        break;

      default:
        return new Response(
          JSON.stringify({ error: 'Method not allowed' }),
          { 
            status: 405, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
    }

    return new Response(
      JSON.stringify({ error: 'Not found' }),
      { 
        status: 404, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('API Error:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        message: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});

/**
 * GET /interactions - List interactions with filtering and pagination
 */
async function getInteractions(req: Request, url: URL, user: any) {
  const searchParams = url.searchParams;
  
  // Build query with filters
  let query = supabaseAdmin
    .from('interactions')
    .select(`
      *,
      organizations!organizationId (id, name),
      contacts!contactId (id, firstName, lastName),
      deals!opportunityId (id, name),
      settings!typeId (id, label, color)
    `);

  // Apply filters
  if (searchParams.get('organizationId')) {
    query = query.eq('organizationId', searchParams.get('organizationId'));
  }
  
  if (searchParams.get('contactId')) {
    query = query.eq('contactId', searchParams.get('contactId'));
  }
  
  if (searchParams.get('typeId')) {
    query = query.eq('typeId', searchParams.get('typeId'));
  }
  
  if (searchParams.get('isCompleted')) {
    query = query.eq('isCompleted', searchParams.get('isCompleted') === 'true');
  }
  
  if (searchParams.get('followUpRequired')) {
    query = query.eq('followUpRequired', searchParams.get('followUpRequired') === 'true');
  }

  // Date range filters
  if (searchParams.get('startDate')) {
    query = query.gte('scheduledDate', searchParams.get('startDate'));
  }
  
  if (searchParams.get('endDate')) {
    query = query.lte('scheduledDate', searchParams.get('endDate'));
  }

  // Pagination
  const page = parseInt(searchParams.get('page') || '1');
  const perPage = parseInt(searchParams.get('perPage') || '25');
  const from = (page - 1) * perPage;
  const to = from + perPage - 1;

  // Apply pagination and ordering
  query = query
    .range(from, to)
    .order('scheduledDate', { ascending: false });

  const { data, error, count } = await query;

  if (error) {
    throw new Error(`Failed to fetch interactions: ${error.message}`);
  }

  return new Response(
    JSON.stringify({
      data: data || [],
      total: count || 0,
      page,
      perPage,
    }),
    { 
      status: 200, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    }
  );
}

/**
 * GET /interactions/:id - Get specific interaction
 */
async function getInteraction(req: Request, url: URL, user: any, interactionId: string) {
  const { data, error } = await supabaseAdmin
    .from('interactions')
    .select(`
      *,
      organizations!organizationId (id, name, address, city, state),
      contacts!contactId (id, firstName, lastName, email, phone),
      deals!opportunityId (id, name, stage, probability, amount),
      settings!typeId (id, label, color)
    `)
    .eq('id', interactionId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return new Response(
        JSON.stringify({ error: 'Interaction not found' }),
        { 
          status: 404, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }
    throw new Error(`Failed to fetch interaction: ${error.message}`);
  }

  return new Response(
    JSON.stringify({ data }),
    { 
      status: 200, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    }
  );
}

/**
 * POST /interactions - Create new interaction
 */
async function createInteraction(req: Request, url: URL, user: any) {
  const body = await req.json();
  
  // Validate required fields
  if (!body.organizationId || !body.typeId || !body.subject) {
    return new Response(
      JSON.stringify({ 
        error: 'Missing required fields: organizationId, typeId, subject' 
      }),
      { 
        status: 400, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }

  // Add audit fields
  const interactionData = {
    ...body,
    createdBy: user.id,
    createdAt: new Date().toISOString(),
    isCompleted: body.isCompleted || false,
    followUpRequired: body.followUpRequired || false,
  };

  const { data, error } = await supabaseAdmin
    .from('interactions')
    .insert(interactionData)
    .select(`
      *,
      organizations!organizationId (id, name),
      contacts!contactId (id, firstName, lastName),
      deals!opportunityId (id, name),
      settings!typeId (id, label, color)
    `)
    .single();

  if (error) {
    throw new Error(`Failed to create interaction: ${error.message}`);
  }

  return new Response(
    JSON.stringify({ 
      data,
      message: 'Interaction created successfully' 
    }),
    { 
      status: 201, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    }
  );
}

/**
 * PUT /interactions/:id - Update interaction
 */
async function updateInteraction(req: Request, url: URL, user: any, interactionId: string) {
  const body = await req.json();
  
  // Add update timestamp
  const updateData = {
    ...body,
    updatedAt: new Date().toISOString(),
  };

  const { data, error } = await supabaseAdmin
    .from('interactions')
    .update(updateData)
    .eq('id', interactionId)
    .select(`
      *,
      organizations!organizationId (id, name),
      contacts!contactId (id, firstName, lastName),
      deals!opportunityId (id, name),
      settings!typeId (id, label, color)
    `)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return new Response(
        JSON.stringify({ error: 'Interaction not found' }),
        { 
          status: 404, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }
    throw new Error(`Failed to update interaction: ${error.message}`);
  }

  return new Response(
    JSON.stringify({ 
      data,
      message: 'Interaction updated successfully' 
    }),
    { 
      status: 200, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    }
  );
}

/**
 * DELETE /interactions/:id - Delete interaction
 */
async function deleteInteraction(req: Request, url: URL, user: any, interactionId: string) {
  const { error } = await supabaseAdmin
    .from('interactions')
    .delete()
    .eq('id', interactionId);

  if (error) {
    throw new Error(`Failed to delete interaction: ${error.message}`);
  }

  return new Response(
    JSON.stringify({ message: 'Interaction deleted successfully' }),
    { 
      status: 200, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    }
  );
}

/**
 * POST /interactions/:id/complete - Mark interaction as completed
 */
async function completeInteraction(req: Request, url: URL, user: any, interactionId: string) {
  const body = await req.json();
  
  const updateData = {
    isCompleted: true,
    completedDate: new Date().toISOString(),
    duration: body.duration,
    outcome: body.outcome,
    updatedAt: new Date().toISOString(),
  };

  const { data, error } = await supabaseAdmin
    .from('interactions')
    .update(updateData)
    .eq('id', interactionId)
    .select('*')
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return new Response(
        JSON.stringify({ error: 'Interaction not found' }),
        { 
          status: 404, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }
    throw new Error(`Failed to complete interaction: ${error.message}`);
  }

  return new Response(
    JSON.stringify({ 
      data,
      message: 'Interaction completed successfully' 
    }),
    { 
      status: 200, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    }
  );
}

/**
 * POST /interactions/:id/schedule-follow-up - Schedule follow-up
 */
async function scheduleFollowUp(req: Request, url: URL, user: any, interactionId: string) {
  const body = await req.json();
  
  if (!body.followUpDate) {
    return new Response(
      JSON.stringify({ error: 'followUpDate is required' }),
      { 
        status: 400, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }

  const updateData = {
    followUpRequired: true,
    followUpDate: body.followUpDate,
    followUpNotes: body.followUpNotes,
    updatedAt: new Date().toISOString(),
  };

  const { data, error } = await supabaseAdmin
    .from('interactions')
    .update(updateData)
    .eq('id', interactionId)
    .select('*')
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return new Response(
        JSON.stringify({ error: 'Interaction not found' }),
        { 
          status: 404, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }
    throw new Error(`Failed to schedule follow-up: ${error.message}`);
  }

  return new Response(
    JSON.stringify({ 
      data,
      message: 'Follow-up scheduled successfully' 
    }),
    { 
      status: 200, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    }
  );
}

/**
 * POST /interactions/:id/add-location - Add GPS location to interaction
 */
async function addLocationToInteraction(req: Request, url: URL, user: any, interactionId: string) {
  const body = await req.json();
  
  if (!body.latitude || !body.longitude) {
    return new Response(
      JSON.stringify({ error: 'latitude and longitude are required' }),
      { 
        status: 400, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }

  const updateData = {
    latitude: parseFloat(body.latitude),
    longitude: parseFloat(body.longitude),
    locationNotes: body.locationNotes || `Location added at ${new Date().toISOString()}`,
    updatedAt: new Date().toISOString(),
  };

  const { data, error } = await supabaseAdmin
    .from('interactions')
    .update(updateData)
    .eq('id', interactionId)
    .select('*')
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return new Response(
        JSON.stringify({ error: 'Interaction not found' }),
        { 
          status: 404, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }
    throw new Error(`Failed to add location: ${error.message}`);
  }

  return new Response(
    JSON.stringify({ 
      data,
      message: 'Location added successfully' 
    }),
    { 
      status: 200, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    }
  );
}

/**
 * GET /interactions/timeline - Get interaction timeline with filtering
 */
async function getInteractionTimeline(req: Request, url: URL, user: any) {
  const searchParams = url.searchParams;
  
  let query = supabaseAdmin
    .from('interactions')
    .select(`
      *,
      organizations!organizationId (id, name),
      contacts!contactId (id, firstName, lastName),
      settings!typeId (id, label, color)
    `);

  // Apply filters
  if (searchParams.get('organizationId')) {
    query = query.eq('organizationId', searchParams.get('organizationId'));
  }
  
  if (searchParams.get('contactId')) {
    query = query.eq('contactId', searchParams.get('contactId'));
  }
  
  if (searchParams.get('startDate')) {
    query = query.gte('scheduledDate', searchParams.get('startDate'));
  }
  
  if (searchParams.get('endDate')) {
    query = query.lte('scheduledDate', searchParams.get('endDate'));
  }

  // Order by date for timeline view
  query = query.order('scheduledDate', { ascending: false }).limit(1000);

  const { data, error } = await query;

  if (error) {
    throw new Error(`Failed to fetch timeline: ${error.message}`);
  }

  return new Response(
    JSON.stringify({ 
      data: data || [],
      total: data?.length || 0 
    }),
    { 
      status: 200, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    }
  );
}

/**
 * GET /interactions/follow-ups - Get follow-up reminders
 */
async function getFollowUpReminders(req: Request, url: URL, user: any) {
  const searchParams = url.searchParams;
  const overdue = searchParams.get('overdue') === 'true';
  const upcoming = searchParams.get('upcoming') === 'true';
  const days = parseInt(searchParams.get('days') || '7');
  
  let query = supabaseAdmin
    .from('interactions')
    .select(`
      *,
      organizations!organizationId (id, name),
      contacts!contactId (id, firstName, lastName),
      settings!typeId (id, label, color)
    `)
    .eq('followUpRequired', true)
    .eq('isCompleted', false);

  const now = new Date();
  
  if (overdue) {
    query = query.lt('followUpDate', now.toISOString());
  } else if (upcoming) {
    const futureDate = new Date();
    futureDate.setDate(now.getDate() + days);
    query = query
      .gte('followUpDate', now.toISOString())
      .lte('followUpDate', futureDate.toISOString());
  }

  query = query.order('followUpDate', { ascending: true }).limit(1000);

  const { data, error } = await query;

  if (error) {
    throw new Error(`Failed to fetch follow-ups: ${error.message}`);
  }

  return new Response(
    JSON.stringify({ 
      data: data || [],
      total: data?.length || 0 
    }),
    { 
      status: 200, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    }
  );
}