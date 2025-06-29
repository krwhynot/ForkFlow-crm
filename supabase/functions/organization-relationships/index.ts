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
 * Organization Relationships API Endpoints
 * Provides hierarchy mapping, contact network analysis, and competitive tracking
 */
serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const pathSegments = url.pathname.split('/').filter(Boolean);
    
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
        if (url.pathname.includes('/hierarchy')) {
          return await getOrganizationHierarchy(req, url, user);
        } else if (url.pathname.includes('/relationships')) {
          return await getOrganizationRelationships(req, url, user);
        } else if (url.pathname.includes('/contact-network')) {
          return await getContactNetwork(req, url, user);
        } else if (url.pathname.includes('/influence-map')) {
          return await getInfluenceMap(req, url, user);
        } else if (url.pathname.includes('/competitors')) {
          return await getCompetitors(req, url, user);
        } else if (url.pathname.includes('/market-share')) {
          return await getMarketShare(req, url, user);
        } else if (url.pathname.includes('/competitive-analysis')) {
          return await getCompetitiveAnalysis(req, url, user);
        }
        break;

      case 'POST':
        if (url.pathname.includes('/relationships')) {
          return await createRelationship(req, url, user);
        } else if (url.pathname.includes('/competitors')) {
          return await addCompetitor(req, url, user);
        }
        break;

      case 'PUT':
        if (url.pathname.includes('/relationships')) {
          return await updateRelationship(req, url, user);
        }
        break;

      case 'DELETE':
        if (url.pathname.includes('/relationships')) {
          return await deleteRelationship(req, url, user);
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
    console.error('Organization Relationships API Error:', error);
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
 * GET /organization-relationships/hierarchy - Get organization hierarchy
 */
async function getOrganizationHierarchy(req: Request, url: URL, user: any) {
  const searchParams = url.searchParams;
  const organizationId = searchParams.get('organizationId');
  const includeChildren = searchParams.get('includeChildren') !== 'false';
  const includeParents = searchParams.get('includeParents') !== 'false';
  const maxDepth = parseInt(searchParams.get('maxDepth') || '3');

  if (!organizationId) {
    return new Response(
      JSON.stringify({ error: 'organizationId parameter is required' }),
      { 
        status: 400, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }

  try {
    // Get the root organization
    const { data: rootOrg, error: rootError } = await supabaseAdmin
      .from('organizations')
      .select(`
        *,
        priority:settings!priorityId (id, label, color),
        segment:settings!segmentId (id, label, color),
        distributor:settings!distributorId (id, label, color)
      `)
      .eq('id', organizationId)
      .single();

    if (rootError) {
      throw new Error(`Failed to fetch organization: ${rootError.message}`);
    }

    const hierarchy = {
      organization: rootOrg,
      children: [],
      parents: [],
      siblings: [],
      relationships: []
    };

    // Get organization relationships
    const { data: relationships, error: relError } = await supabaseAdmin
      .from('organization_relationships')
      .select('*')
      .or(`parentId.eq.${organizationId},childId.eq.${organizationId}`)
      .order('createdAt', { ascending: false });

    if (relError) {
      console.warn('Failed to fetch relationships:', relError);
    }

    // Build hierarchy tree
    if (includeChildren && relationships) {
      hierarchy.children = await buildChildrenTree(organizationId, maxDepth, 1);
    }

    if (includeParents && relationships) {
      hierarchy.parents = await buildParentTree(organizationId, maxDepth, 1);
    }

    // Get siblings (organizations with same parent)
    const parentRelationships = relationships?.filter(r => r.childId === parseInt(organizationId));
    if (parentRelationships && parentRelationships.length > 0) {
      const parentId = parentRelationships[0].parentId;
      const { data: siblings } = await supabaseAdmin
        .from('organization_relationships')
        .select(`
          childId,
          organizations!childId (
            id, name, address, city, state,
            priority:settings!priorityId (id, label, color),
            segment:settings!segmentId (id, label, color)
          )
        `)
        .eq('parentId', parentId)
        .neq('childId', organizationId);

      hierarchy.siblings = siblings?.map(s => s.organizations) || [];
    }

    // Add relationship metadata
    hierarchy.relationships = relationships?.map(rel => ({
      id: rel.id,
      type: rel.relationshipType,
      parentId: rel.parentId,
      childId: rel.childId,
      strength: rel.strength,
      notes: rel.notes,
      createdAt: rel.createdAt,
    })) || [];

    // Calculate hierarchy metrics
    const metrics = {
      totalChildren: await countTotalChildren(organizationId),
      totalParents: await countTotalParents(organizationId),
      hierarchyDepth: await calculateHierarchyDepth(organizationId),
      relationshipTypes: getRelationshipTypeSummary(relationships || []),
    };

    return new Response(
      JSON.stringify({
        data: hierarchy,
        metrics,
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Hierarchy fetch error:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Failed to fetch organization hierarchy',
        message: error.message
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
}

/**
 * GET /organization-relationships/contact-network - Get contact network analysis
 */
async function getContactNetwork(req: Request, url: URL, user: any) {
  const searchParams = url.searchParams;
  const organizationId = searchParams.get('organizationId');
  const includeInfluence = searchParams.get('includeInfluence') !== 'false';
  const maxConnections = parseInt(searchParams.get('maxConnections') || '50');

  if (!organizationId) {
    return new Response(
      JSON.stringify({ error: 'organizationId parameter is required' }),
      { 
        status: 400, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }

  try {
    // Get organization contacts
    const { data: contacts, error: contactsError } = await supabaseAdmin
      .from('contacts')
      .select(`
        *,
        organization:organizations (id, name),
        role:settings!roleId (id, label),
        influenceLevel:settings!influenceLevelId (id, label),
        decisionRole:settings!decisionRoleId (id, label)
      `)
      .eq('organizationId', organizationId)
      .order('isPrimary', { ascending: false });

    if (contactsError) {
      throw new Error(`Failed to fetch contacts: ${contactsError.message}`);
    }

    // Get interactions to determine contact activity and relationships
    const { data: interactions, error: interactionsError } = await supabaseAdmin
      .from('interactions')
      .select('*')
      .eq('organizationId', organizationId)
      .order('scheduledDate', { ascending: false })
      .limit(500);

    if (interactionsError) {
      console.warn('Failed to fetch interactions:', interactionsError);
    }

    // Calculate contact influence scores
    const contactNetwork = contacts?.map(contact => {
      const contactInteractions = interactions?.filter(i => i.contactId === contact.id) || [];
      
      // Calculate influence score based on multiple factors
      let influenceScore = 0;
      
      // Role-based influence
      if (contact.role?.label?.toLowerCase().includes('ceo') || 
          contact.role?.label?.toLowerCase().includes('president')) {
        influenceScore += 40;
      } else if (contact.role?.label?.toLowerCase().includes('director') ||
                 contact.role?.label?.toLowerCase().includes('manager')) {
        influenceScore += 25;
      } else if (contact.role?.label?.toLowerCase().includes('coordinator') ||
                 contact.role?.label?.toLowerCase().includes('specialist')) {
        influenceScore += 15;
      }

      // Decision role influence
      if (contact.decisionRole?.label?.toLowerCase().includes('decision maker')) {
        influenceScore += 30;
      } else if (contact.decisionRole?.label?.toLowerCase().includes('influencer')) {
        influenceScore += 20;
      } else if (contact.decisionRole?.label?.toLowerCase().includes('champion')) {
        influenceScore += 25;
      }

      // Interaction frequency influence
      const recentInteractions = contactInteractions.filter(i => {
        const date = new Date(i.scheduledDate || i.createdAt);
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
        return date >= sixMonthsAgo;
      });
      
      influenceScore += Math.min(20, recentInteractions.length * 2);

      // Primary contact bonus
      if (contact.isPrimary) {
        influenceScore += 15;
      }

      return {
        ...contact,
        influenceScore: Math.min(100, influenceScore),
        interactionCount: contactInteractions.length,
        recentInteractionCount: recentInteractions.length,
        lastInteractionDate: contactInteractions[0]?.scheduledDate || contactInteractions[0]?.createdAt,
        networkConnections: [], // Would be populated with actual network data
      };
    }) || [];

    // Sort by influence score
    contactNetwork.sort((a, b) => b.influenceScore - a.influenceScore);

    // Build network analysis
    const networkAnalysis = {
      totalContacts: contactNetwork.length,
      averageInfluence: contactNetwork.reduce((sum, c) => sum + c.influenceScore, 0) / contactNetwork.length,
      topInfluencers: contactNetwork.slice(0, 5),
      decisionMakers: contactNetwork.filter(c => 
        c.decisionRole?.label?.toLowerCase().includes('decision maker') ||
        c.role?.label?.toLowerCase().includes('ceo') ||
        c.role?.label?.toLowerCase().includes('president')
      ),
      champions: contactNetwork.filter(c => 
        c.decisionRole?.label?.toLowerCase().includes('champion')
      ),
      influencers: contactNetwork.filter(c => 
        c.decisionRole?.label?.toLowerCase().includes('influencer')
      ),
      contactCoverage: {
        executive: contactNetwork.filter(c => c.influenceScore >= 70).length,
        management: contactNetwork.filter(c => c.influenceScore >= 40 && c.influenceScore < 70).length,
        operational: contactNetwork.filter(c => c.influenceScore < 40).length,
      },
      engagementHealth: {
        active: contactNetwork.filter(c => c.recentInteractionCount > 0).length,
        dormant: contactNetwork.filter(c => c.recentInteractionCount === 0 && c.interactionCount > 0).length,
        new: contactNetwork.filter(c => c.interactionCount === 0).length,
      }
    };

    return new Response(
      JSON.stringify({
        data: contactNetwork.slice(0, maxConnections),
        analysis: networkAnalysis,
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Contact network error:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Failed to analyze contact network',
        message: error.message
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
}

/**
 * GET /organization-relationships/competitors - Get competitive analysis
 */
async function getCompetitors(req: Request, url: URL, user: any) {
  const searchParams = url.searchParams;
  const organizationId = searchParams.get('organizationId');
  const includeAnalysis = searchParams.get('includeAnalysis') !== 'false';

  try {
    // Get competitor relationships
    const { data: competitors, error: competitorsError } = await supabaseAdmin
      .from('organization_competitors')
      .select(`
        *,
        competitor:organizations!competitorId (
          id, name, address, city, state, website,
          priority:settings!priorityId (id, label, color),
          segment:settings!segmentId (id, label, color)
        )
      `)
      .eq('organizationId', organizationId)
      .order('threatLevel', { ascending: false });

    if (competitorsError) {
      throw new Error(`Failed to fetch competitors: ${competitorsError.message}`);
    }

    // Get industry/segment analysis if requested
    let marketAnalysis = null;
    if (includeAnalysis) {
      const { data: organization } = await supabaseAdmin
        .from('organizations')
        .select('segmentId')
        .eq('id', organizationId)
        .single();

      if (organization?.segmentId) {
        // Get all organizations in same segment for market analysis
        const { data: segmentOrgs } = await supabaseAdmin
          .from('organizations')
          .select('id, name')
          .eq('segmentId', organization.segmentId)
          .neq('id', organizationId);

        marketAnalysis = {
          segmentSize: segmentOrgs?.length || 0,
          marketPosition: calculateMarketPosition(competitors || []),
          competitiveAdvantages: identifyCompetitiveAdvantages(competitors || []),
          threats: identifyThreats(competitors || []),
          opportunities: identifyOpportunities(competitors || []),
        };
      }
    }

    return new Response(
      JSON.stringify({
        data: competitors || [],
        analysis: marketAnalysis,
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Competitors fetch error:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Failed to fetch competitors',
        message: error.message
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
}

/**
 * Helper functions for building hierarchy trees
 */
async function buildChildrenTree(parentId: string, maxDepth: number, currentDepth: number): Promise<any[]> {
  if (currentDepth > maxDepth) return [];

  const { data: relationships } = await supabaseAdmin
    .from('organization_relationships')
    .select(`
      *,
      child:organizations!childId (
        id, name, address, city, state,
        priority:settings!priorityId (id, label, color),
        segment:settings!segmentId (id, label, color)
      )
    `)
    .eq('parentId', parentId);

  if (!relationships) return [];

  const children = [];
  for (const rel of relationships) {
    const childNode = {
      ...rel.child,
      relationship: {
        type: rel.relationshipType,
        strength: rel.strength,
        notes: rel.notes,
      },
      children: await buildChildrenTree(rel.childId.toString(), maxDepth, currentDepth + 1),
    };
    children.push(childNode);
  }

  return children;
}

async function buildParentTree(childId: string, maxDepth: number, currentDepth: number): Promise<any[]> {
  if (currentDepth > maxDepth) return [];

  const { data: relationships } = await supabaseAdmin
    .from('organization_relationships')
    .select(`
      *,
      parent:organizations!parentId (
        id, name, address, city, state,
        priority:settings!priorityId (id, label, color),
        segment:settings!segmentId (id, label, color)
      )
    `)
    .eq('childId', childId);

  if (!relationships) return [];

  const parents = [];
  for (const rel of relationships) {
    const parentNode = {
      ...rel.parent,
      relationship: {
        type: rel.relationshipType,
        strength: rel.strength,
        notes: rel.notes,
      },
      parents: await buildParentTree(rel.parentId.toString(), maxDepth, currentDepth + 1),
    };
    parents.push(parentNode);
  }

  return parents;
}

async function countTotalChildren(organizationId: string): Promise<number> {
  const { count } = await supabaseAdmin
    .from('organization_relationships')
    .select('*', { count: 'exact', head: true })
    .eq('parentId', organizationId);
  
  return count || 0;
}

async function countTotalParents(organizationId: string): Promise<number> {
  const { count } = await supabaseAdmin
    .from('organization_relationships')
    .select('*', { count: 'exact', head: true })
    .eq('childId', organizationId);
  
  return count || 0;
}

async function calculateHierarchyDepth(organizationId: string): Promise<number> {
  // Simplified depth calculation - would need recursive query in production
  return 3; // Placeholder
}

function getRelationshipTypeSummary(relationships: any[]): Record<string, number> {
  const summary: Record<string, number> = {};
  relationships.forEach(rel => {
    summary[rel.relationshipType] = (summary[rel.relationshipType] || 0) + 1;
  });
  return summary;
}

function calculateMarketPosition(competitors: any[]): string {
  const threatLevels = competitors.map(c => c.threatLevel || 0);
  const avgThreat = threatLevels.reduce((sum, level) => sum + level, 0) / threatLevels.length;
  
  if (avgThreat > 7) return 'Challenged';
  if (avgThreat > 5) return 'Competitive';
  if (avgThreat > 3) return 'Strong';
  return 'Dominant';
}

function identifyCompetitiveAdvantages(competitors: any[]): string[] {
  // Simplified analysis - would be more sophisticated in production
  return [
    'Strong customer relationships',
    'Geographic coverage',
    'Product portfolio depth',
  ];
}

function identifyThreats(competitors: any[]): string[] {
  return competitors
    .filter(c => c.threatLevel > 6)
    .map(c => `${c.competitor?.name}: ${c.notes || 'Strong competitor'}`)
    .slice(0, 5);
}

function identifyOpportunities(competitors: any[]): string[] {
  return [
    'Market expansion opportunities',
    'Technology differentiation',
    'Service enhancement potential',
  ];
}

// Placeholder implementations for remaining endpoints
async function getOrganizationRelationships(req: Request, url: URL, user: any) {
  return new Response(
    JSON.stringify({ message: 'Organization relationships endpoint - detailed implementation' }),
    { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function getInfluenceMap(req: Request, url: URL, user: any) {
  return new Response(
    JSON.stringify({ message: 'Influence map endpoint - to be implemented' }),
    { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function getMarketShare(req: Request, url: URL, user: any) {
  return new Response(
    JSON.stringify({ message: 'Market share endpoint - to be implemented' }),
    { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function getCompetitiveAnalysis(req: Request, url: URL, user: any) {
  return new Response(
    JSON.stringify({ message: 'Competitive analysis endpoint - to be implemented' }),
    { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function createRelationship(req: Request, url: URL, user: any) {
  return new Response(
    JSON.stringify({ message: 'Create relationship endpoint - to be implemented' }),
    { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function updateRelationship(req: Request, url: URL, user: any) {
  return new Response(
    JSON.stringify({ message: 'Update relationship endpoint - to be implemented' }),
    { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function deleteRelationship(req: Request, url: URL, user: any) {
  return new Response(
    JSON.stringify({ message: 'Delete relationship endpoint - to be implemented' }),
    { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function addCompetitor(req: Request, url: URL, user: any) {
  return new Response(
    JSON.stringify({ message: 'Add competitor endpoint - to be implemented' }),
    { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}