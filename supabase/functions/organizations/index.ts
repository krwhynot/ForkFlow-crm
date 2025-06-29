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
 * Organization Management API Endpoints
 * Provides REST-like endpoints for mobile-optimized organization management
 */
serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const pathSegments = url.pathname.split('/').filter(Boolean);
    
    // Extract organization ID if present in path
    const organizationId = pathSegments[pathSegments.length - 1];
    const isSpecificOrganization = /^\d+$/.test(organizationId);
    
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
        if (url.pathname.includes('/search')) {
          return await searchOrganizations(req, url, user);
        } else if (url.pathname.includes('/nearby')) {
          return await findNearbyOrganizations(req, url, user);
        } else if (url.pathname.includes('/territory')) {
          return await getTerritoryOrganizations(req, url, user);
        } else if (url.pathname.includes('/needs-attention')) {
          return await getOrganizationsNeedingAttention(req, url, user);
        } else if (url.pathname.includes('/summary')) {
          return await getOrganizationSummary(req, url, user, organizationId);
        } else if (url.pathname.includes('/analytics')) {
          return await getOrganizationAnalytics(req, url, user, organizationId);
        } else if (isSpecificOrganization) {
          return await getOrganization(req, url, user, organizationId);
        } else {
          return await getOrganizations(req, url, user);
        }

      case 'POST':
        if (url.pathname.includes('/bulk-import')) {
          return await bulkImportOrganizations(req, url, user);
        } else if (url.pathname.includes('/geocode')) {
          return await geocodeOrganization(req, url, user, organizationId);
        } else {
          return await createOrganization(req, url, user);
        }

      case 'PUT':
        if (isSpecificOrganization) {
          return await updateOrganization(req, url, user, organizationId);
        }
        break;

      case 'DELETE':
        if (isSpecificOrganization) {
          return await deleteOrganization(req, url, user, organizationId);
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
 * GET /organizations - List organizations with filtering and pagination
 */
async function getOrganizations(req: Request, url: URL, user: any) {
  const searchParams = url.searchParams;
  
  // Build query with filters
  let query = supabaseAdmin
    .from('organizations')
    .select(`
      *,
      priority:settings!priorityId (id, label, color),
      segment:settings!segmentId (id, label, color),
      distributor:settings!distributorId (id, label, color)
    `);

  // Apply filters
  if (searchParams.get('priorityId')) {
    query = query.eq('priorityId', searchParams.get('priorityId'));
  }
  
  if (searchParams.get('segmentId')) {
    query = query.eq('segmentId', searchParams.get('segmentId'));
  }
  
  if (searchParams.get('distributorId')) {
    query = query.eq('distributorId', searchParams.get('distributorId'));
  }
  
  if (searchParams.get('accountManager')) {
    query = query.eq('accountManager', searchParams.get('accountManager'));
  }

  if (searchParams.get('city')) {
    query = query.ilike('city', `%${searchParams.get('city')}%`);
  }

  if (searchParams.get('state')) {
    query = query.eq('state', searchParams.get('state'));
  }

  // Text search across multiple fields
  if (searchParams.get('q')) {
    const searchTerm = searchParams.get('q');
    query = query.or(`
      name.ilike.%${searchTerm}%,
      address.ilike.%${searchTerm}%,
      city.ilike.%${searchTerm}%,
      notes.ilike.%${searchTerm}%,
      phone.ilike.%${searchTerm}%,
      website.ilike.%${searchTerm}%
    `);
  }

  // Pagination
  const page = parseInt(searchParams.get('page') || '1');
  const perPage = parseInt(searchParams.get('perPage') || '25');
  const from = (page - 1) * perPage;
  const to = from + perPage - 1;

  // Apply pagination and ordering
  const sortField = searchParams.get('sortField') || 'name';
  const sortOrder = searchParams.get('sortOrder') === 'DESC' ? false : true;
  
  query = query
    .range(from, to)
    .order(sortField, { ascending: sortOrder });

  const { data, error, count } = await query;

  if (error) {
    throw new Error(`Failed to fetch organizations: ${error.message}`);
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
 * GET /organizations/search - Advanced search with full-text search and ranking
 */
async function searchOrganizations(req: Request, url: URL, user: any) {
  const searchParams = url.searchParams;
  const query = searchParams.get('q') || '';
  const limit = parseInt(searchParams.get('limit') || '20');
  const includeDistance = searchParams.get('includeDistance') === 'true';
  const sortBy = searchParams.get('sortBy') || 'relevance';
  
  // Parse location if provided
  let location: { latitude: number; longitude: number } | undefined;
  if (searchParams.get('lat') && searchParams.get('lng')) {
    location = {
      latitude: parseFloat(searchParams.get('lat')!),
      longitude: parseFloat(searchParams.get('lng')!),
    };
  }
  
  const radiusKm = searchParams.get('radiusKm') ? 
    parseFloat(searchParams.get('radiusKm')!) : undefined;

  // Build enhanced search query
  let searchQuery = supabaseAdmin
    .from('organizations')
    .select(`
      *,
      priority:settings!priorityId (id, label, color),
      segment:settings!segmentId (id, label, color),
      distributor:settings!distributorId (id, label, color)
    `);

  // Apply text search with ranking
  if (query.trim()) {
    searchQuery = searchQuery.or(`
      name.ilike.%${query}%,
      address.ilike.%${query}%,
      city.ilike.%${query}%,
      notes.ilike.%${query}%,
      phone.ilike.%${query}%,
      website.ilike.%${query}%
    `);
  }

  // Apply proximity filter if location provided
  if (location && radiusKm) {
    searchQuery = searchQuery
      .not('latitude', 'is', null)
      .not('longitude', 'is', null);
  }

  // Apply limit and ordering
  searchQuery = searchQuery.limit(limit);

  const { data, error } = await searchQuery;

  if (error) {
    throw new Error(`Organization search failed: ${error.message}`);
  }

  // Post-process results for distance and ranking
  let results = (data || []).map(org => {
    const result: any = { ...org };

    // Calculate distance if location provided
    if (location && org.latitude && org.longitude) {
      result.distance = calculateDistance(
        location.latitude,
        location.longitude,
        org.latitude,
        org.longitude
      );
    }

    // Calculate match score for text search
    if (query.trim()) {
      result.matchScore = calculateMatchScore(org, query);
      result.matchReasons = getMatchReasons(org, query);
    }

    return result;
  });

  // Filter by radius if needed
  if (location && radiusKm) {
    results = results.filter(org => 
      org.distance !== undefined && org.distance <= radiusKm
    );
  }

  // Sort results
  if (sortBy === 'distance' && location) {
    results.sort((a, b) => (a.distance || 0) - (b.distance || 0));
  } else if (sortBy === 'relevance' && query.trim()) {
    results.sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));
  } else {
    results.sort((a, b) => a.name.localeCompare(b.name));
  }

  return new Response(
    JSON.stringify({
      data: results,
      total: results.length,
      query,
      location,
      radiusKm,
    }),
    { 
      status: 200, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    }
  );
}

/**
 * GET /organizations/nearby - Find organizations near GPS coordinates
 */
async function findNearbyOrganizations(req: Request, url: URL, user: any) {
  const searchParams = url.searchParams;
  
  const latitude = parseFloat(searchParams.get('lat') || '0');
  const longitude = parseFloat(searchParams.get('lng') || '0');
  const radiusKm = parseFloat(searchParams.get('radiusKm') || '10');
  const limit = parseInt(searchParams.get('limit') || '25');

  if (!latitude || !longitude) {
    return new Response(
      JSON.stringify({ error: 'lat and lng parameters are required' }),
      { 
        status: 400, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }

  // Get organizations with GPS coordinates
  const { data, error } = await supabaseAdmin
    .from('organizations')
    .select(`
      *,
      priority:settings!priorityId (id, label, color),
      segment:settings!segmentId (id, label, color),
      distributor:settings!distributorId (id, label, color)
    `)
    .not('latitude', 'is', null)
    .not('longitude', 'is', null)
    .limit(1000); // Get more to filter by distance

  if (error) {
    throw new Error(`Failed to fetch nearby organizations: ${error.message}`);
  }

  // Calculate distances and filter by radius
  const nearbyOrgs = (data || [])
    .map(org => ({
      ...org,
      distance: calculateDistance(latitude, longitude, org.latitude, org.longitude)
    }))
    .filter(org => org.distance <= radiusKm)
    .sort((a, b) => a.distance - b.distance)
    .slice(0, limit);

  return new Response(
    JSON.stringify({
      data: nearbyOrgs,
      total: nearbyOrgs.length,
      location: { latitude, longitude },
      radiusKm,
    }),
    { 
      status: 200, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    }
  );
}

/**
 * GET /organizations/territory/:userId - Get organizations in user's territory
 */
async function getTerritoryOrganizations(req: Request, url: URL, user: any) {
  const pathSegments = url.pathname.split('/');
  const userId = pathSegments[pathSegments.length - 1];
  
  if (!userId) {
    return new Response(
      JSON.stringify({ error: 'User ID is required' }),
      { 
        status: 400, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }

  // Get organizations assigned to user
  const { data, error } = await supabaseAdmin
    .from('organizations')
    .select(`
      *,
      priority:settings!priorityId (id, label, color),
      segment:settings!segmentId (id, label, color),
      distributor:settings!distributorId (id, label, color)
    `)
    .eq('accountManager', userId)
    .order('name');

  if (error) {
    throw new Error(`Failed to fetch territory organizations: ${error.message}`);
  }

  return new Response(
    JSON.stringify({
      data: data || [],
      total: data?.length || 0,
      userId,
    }),
    { 
      status: 200, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    }
  );
}

/**
 * GET /organizations/needs-attention - Organizations requiring follow-up
 */
async function getOrganizationsNeedingAttention(req: Request, url: URL, user: any) {
  const searchParams = url.searchParams;
  const days = parseInt(searchParams.get('days') || '30');
  const userId = searchParams.get('userId');
  
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);

  // Build query
  let query = supabaseAdmin
    .from('organizations')
    .select(`
      *,
      priority:settings!priorityId (id, label, color),
      segment:settings!segmentId (id, label, color),
      distributor:settings!distributorId (id, label, color)
    `)
    .lt('updatedAt', cutoffDate.toISOString())
    .order('updatedAt', { ascending: true });

  if (userId) {
    query = query.eq('accountManager', userId);
  }

  const { data, error } = await query.limit(100);

  if (error) {
    throw new Error(`Failed to fetch organizations needing attention: ${error.message}`);
  }

  return new Response(
    JSON.stringify({
      data: data || [],
      total: data?.length || 0,
      cutoffDate: cutoffDate.toISOString(),
      days,
    }),
    { 
      status: 200, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    }
  );
}

/**
 * GET /organizations/:id/summary - Get comprehensive organization summary
 */
async function getOrganizationSummary(req: Request, url: URL, user: any, organizationId: string) {
  if (!organizationId || !organizationId.match(/^\d+$/)) {
    return new Response(
      JSON.stringify({ error: 'Valid organization ID is required' }),
      { 
        status: 400, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }

  // Get organization with relationships
  const { data: organization, error: orgError } = await supabaseAdmin
    .from('organizations')
    .select(`
      *,
      priority:settings!priorityId (id, label, color),
      segment:settings!segmentId (id, label, color),
      distributor:settings!distributorId (id, label, color)
    `)
    .eq('id', organizationId)
    .single();

  if (orgError) {
    if (orgError.code === 'PGRST116') {
      return new Response(
        JSON.stringify({ error: 'Organization not found' }),
        { 
          status: 404, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }
    throw new Error(`Failed to fetch organization: ${orgError.message}`);
  }

  // Get contacts
  const { data: contacts } = await supabaseAdmin
    .from('contacts')
    .select('*')
    .eq('organizationId', organizationId)
    .order('isPrimary', { ascending: false });

  // Get recent interactions
  const { data: interactions } = await supabaseAdmin
    .from('interactions')
    .select(`
      *,
      settings!typeId (id, label, color)
    `)
    .eq('organizationId', organizationId)
    .order('scheduledDate', { ascending: false })
    .limit(5);

  // Get active deals
  const { data: deals } = await supabaseAdmin
    .from('deals')
    .select('*')
    .eq('organizationId', organizationId)
    .eq('status', 'active')
    .order('updatedAt', { ascending: false });

  // Calculate analytics
  const analytics = calculateOrganizationAnalytics(
    interactions || [],
    deals || []
  );

  const summary = {
    ...organization,
    contactCount: contacts?.length || 0,
    primaryContact: contacts?.find(c => c.isPrimary) ? {
      id: contacts.find(c => c.isPrimary)!.id,
      name: `${contacts.find(c => c.isPrimary)!.firstName} ${contacts.find(c => c.isPrimary)!.lastName}`,
      email: contacts.find(c => c.isPrimary)!.email,
      phone: contacts.find(c => c.isPrimary)!.phone,
    } : null,
    recentInteractions: (interactions || []).map(interaction => ({
      id: interaction.id,
      type: interaction.settings?.label || 'Unknown',
      subject: interaction.subject,
      date: interaction.scheduledDate || interaction.createdAt,
      outcome: interaction.outcome,
    })),
    activeDeals: (deals || []).map(deal => ({
      id: deal.id,
      name: deal.name || `Deal #${deal.id}`,
      stage: deal.stage,
      probability: deal.probability,
      amount: deal.amount,
    })),
    analytics,
  };

  return new Response(
    JSON.stringify({ data: summary }),
    { 
      status: 200, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    }
  );
}

/**
 * POST /organizations - Create new organization
 */
async function createOrganization(req: Request, url: URL, user: any) {
  const body = await req.json();
  
  // Validate required fields
  if (!body.name || !body.name.trim()) {
    return new Response(
      JSON.stringify({ error: 'Organization name is required' }),
      { 
        status: 400, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }

  // Add audit fields
  const organizationData = {
    ...body,
    createdBy: user.id,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const { data, error } = await supabaseAdmin
    .from('organizations')
    .insert(organizationData)
    .select(`
      *,
      priority:settings!priorityId (id, label, color),
      segment:settings!segmentId (id, label, color),
      distributor:settings!distributorId (id, label, color)
    `)
    .single();

  if (error) {
    throw new Error(`Failed to create organization: ${error.message}`);
  }

  return new Response(
    JSON.stringify({ 
      data,
      message: 'Organization created successfully' 
    }),
    { 
      status: 201, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    }
  );
}

/**
 * POST /organizations/bulk-import - Bulk import organizations from CSV
 */
async function bulkImportOrganizations(req: Request, url: URL, user: any) {
  const body = await req.json();
  
  if (!body.organizations || !Array.isArray(body.organizations)) {
    return new Response(
      JSON.stringify({ error: 'organizations array is required' }),
      { 
        status: 400, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }

  const result = {
    success: false,
    processed: 0,
    created: 0,
    updated: 0,
    skipped: 0,
    errors: [],
    duplicates: [],
  };

  for (let i = 0; i < body.organizations.length; i++) {
    const org = body.organizations[i];
    result.processed++;

    try {
      // Validate required fields
      if (!org.name || !org.name.trim()) {
        result.errors.push({
          row: i + 1,
          field: 'name',
          message: 'Organization name is required',
          data: org
        });
        continue;
      }

      // Check for duplicates (simple name match)
      const { data: existing } = await supabaseAdmin
        .from('organizations')
        .select('id, name')
        .ilike('name', org.name.trim())
        .limit(1);

      if (existing && existing.length > 0) {
        if (body.skipDuplicates) {
          result.duplicates.push({
            row: i + 1,
            existingId: existing[0].id,
            reason: 'Name matches existing organization'
          });
          result.skipped++;
          continue;
        } else if (body.updateExisting) {
          // Update existing
          await supabaseAdmin
            .from('organizations')
            .update({
              ...org,
              updatedAt: new Date().toISOString(),
            })
            .eq('id', existing[0].id);
          result.updated++;
          continue;
        }
      }

      // Create new organization
      await supabaseAdmin
        .from('organizations')
        .insert({
          ...org,
          createdBy: user.id,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });

      result.created++;

    } catch (error: any) {
      result.errors.push({
        row: i + 1,
        field: 'general',
        message: error.message,
        data: org
      });
    }
  }

  result.success = result.errors.length === 0;

  return new Response(
    JSON.stringify(result),
    { 
      status: 200, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    }
  );
}

/**
 * Calculate distance between two GPS coordinates using Haversine formula
 */
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

/**
 * Calculate search match score
 */
function calculateMatchScore(org: any, query: string): number {
  const queryLower = query.toLowerCase();
  let score = 0;

  if (org.name.toLowerCase() === queryLower) return 1.0;
  if (org.name.toLowerCase().startsWith(queryLower)) score += 0.8;
  if (org.name.toLowerCase().includes(queryLower)) score += 0.6;
  if (org.address?.toLowerCase().includes(queryLower)) score += 0.3;
  if (org.city?.toLowerCase().includes(queryLower)) score += 0.3;
  if (org.phone?.includes(query)) score += 0.4;
  if (org.website?.toLowerCase().includes(queryLower)) score += 0.3;
  if (org.notes?.toLowerCase().includes(queryLower)) score += 0.2;

  return Math.min(score, 1.0);
}

/**
 * Get match reasons
 */
function getMatchReasons(org: any, query: string): string[] {
  const queryLower = query.toLowerCase();
  const reasons: string[] = [];

  if (org.name.toLowerCase().includes(queryLower)) reasons.push('Organization name');
  if (org.address?.toLowerCase().includes(queryLower)) reasons.push('Address');
  if (org.city?.toLowerCase().includes(queryLower)) reasons.push('City');
  if (org.phone?.includes(query)) reasons.push('Phone number');
  if (org.website?.toLowerCase().includes(queryLower)) reasons.push('Website');
  if (org.notes?.toLowerCase().includes(queryLower)) reasons.push('Notes');

  return reasons;
}

/**
 * Calculate organization analytics
 */
function calculateOrganizationAnalytics(interactions: any[], deals: any[]): any {
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

  const recentInteractions = interactions.filter(i => 
    new Date(i.scheduledDate || i.createdAt) >= thirtyDaysAgo
  );
  const previousInteractions = interactions.filter(i => {
    const date = new Date(i.scheduledDate || i.createdAt);
    return date >= sixtyDaysAgo && date < thirtyDaysAgo;
  });

  let interactionTrend: 'increasing' | 'decreasing' | 'stable' = 'stable';
  if (recentInteractions.length > previousInteractions.length * 1.2) {
    interactionTrend = 'increasing';
  } else if (recentInteractions.length < previousInteractions.length * 0.8) {
    interactionTrend = 'decreasing';
  }

  const daysSinceLastInteraction = interactions.length > 0 
    ? Math.floor((now.getTime() - new Date(interactions[0].scheduledDate || interactions[0].createdAt).getTime()) / (1000 * 60 * 60 * 24))
    : 365;
  
  let engagementScore = Math.max(0, 100 - daysSinceLastInteraction * 2);
  engagementScore += Math.min(30, interactions.length * 2);
  engagementScore = Math.min(100, engagementScore);

  const activeDeals = deals.filter(d => d.status === 'active');
  const totalValue = activeDeals.reduce((sum, deal) => sum + (deal.amount || 0), 0);
  const averageCloseRate = activeDeals.length > 0 
    ? activeDeals.reduce((sum, deal) => sum + (deal.probability || 0), 0) / activeDeals.length
    : 0;

  const riskFactors: string[] = [];
  if (daysSinceLastInteraction > 30) riskFactors.push('No recent interactions');
  if (activeDeals.length === 0) riskFactors.push('No active deals');
  if (averageCloseRate < 25) riskFactors.push('Low deal probability');
  if (interactionTrend === 'decreasing') riskFactors.push('Declining engagement');

  const opportunities: string[] = [];
  if (interactionTrend === 'increasing') opportunities.push('Increasing engagement');
  if (averageCloseRate > 75) opportunities.push('High probability deals');
  if (totalValue > 50000) opportunities.push('High value pipeline');

  return {
    engagementScore,
    lastInteractionDate: interactions[0]?.scheduledDate || interactions[0]?.createdAt,
    interactionCount: interactions.length,
    interactionTrend,
    pipelineHealth: {
      activeDeals: activeDeals.length,
      totalValue,
      averageCloseRate,
      daysToClose: 30,
    },
    riskFactors,
    opportunities,
  };
}