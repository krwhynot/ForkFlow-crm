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
 * Organization Analytics API Endpoints
 * Provides advanced analytics, engagement scoring, and predictive insights for organizations
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
        if (url.pathname.includes('/engagement-scores')) {
          return await getEngagementScores(req, url, user);
        } else if (url.pathname.includes('/risk-assessment')) {
          return await getRiskAssessment(req, url, user);
        } else if (url.pathname.includes('/opportunities')) {
          return await getOpportunities(req, url, user);
        } else if (url.pathname.includes('/performance-trends')) {
          return await getPerformanceTrends(req, url, user);
        } else if (url.pathname.includes('/predictive-insights')) {
          return await getPredictiveInsights(req, url, user);
        } else if (url.pathname.includes('/dashboard')) {
          return await getAnalyticsDashboard(req, url, user);
        } else if (url.pathname.includes('/benchmarks')) {
          return await getBenchmarks(req, url, user);
        } else {
          return await getOrganizationAnalytics(req, url, user);
        }

      case 'POST':
        if (url.pathname.includes('/calculate-scores')) {
          return await calculateAllEngagementScores(req, url, user);
        } else if (url.pathname.includes('/refresh-insights')) {
          return await refreshPredictiveInsights(req, url, user);
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
    console.error('Analytics API Error:', error);
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
 * GET /organization-analytics - Get comprehensive analytics for all organizations
 */
async function getOrganizationAnalytics(req: Request, url: URL, user: any) {
  const searchParams = url.searchParams;
  const limit = parseInt(searchParams.get('limit') || '50');
  const includeInactive = searchParams.get('includeInactive') === 'true';
  const accountManager = searchParams.get('accountManager');
  
  // Get organizations with basic data
  let query = supabaseAdmin
    .from('organizations')
    .select(`
      id, name, accountManager, priorityId, segmentId, 
      updatedAt, createdAt, city, state,
      priority:settings!priorityId (id, label, color),
      segment:settings!segmentId (id, label, color)
    `);

  if (accountManager) {
    query = query.eq('accountManager', accountManager);
  }

  if (!includeInactive) {
    query = query.is('deletedAt', null);
  }

  query = query.order('name').limit(limit);

  const { data: organizations, error } = await query;

  if (error) {
    throw new Error(`Failed to fetch organizations: ${error.message}`);
  }

  // Calculate analytics for each organization
  const analyticsPromises = (organizations || []).map(async (org) => {
    const analytics = await calculateOrganizationMetrics(org.id);
    return {
      ...org,
      analytics,
    };
  });

  const organizationsWithAnalytics = await Promise.all(analyticsPromises);

  // Calculate aggregate metrics
  const aggregateMetrics = calculateAggregateMetrics(organizationsWithAnalytics);

  return new Response(
    JSON.stringify({
      data: organizationsWithAnalytics,
      total: organizationsWithAnalytics.length,
      aggregateMetrics,
    }),
    { 
      status: 200, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    }
  );
}

/**
 * GET /organization-analytics/engagement-scores - Get engagement scores for organizations
 */
async function getEngagementScores(req: Request, url: URL, user: any) {
  const searchParams = url.searchParams;
  const minScore = parseFloat(searchParams.get('minScore') || '0');
  const maxScore = parseFloat(searchParams.get('maxScore') || '100');
  const accountManager = searchParams.get('accountManager');
  
  // Get organizations
  let query = supabaseAdmin
    .from('organizations')
    .select('id, name, accountManager, updatedAt')
    .order('name');

  if (accountManager) {
    query = query.eq('accountManager', accountManager);
  }

  const { data: organizations, error } = await query;

  if (error) {
    throw new Error(`Failed to fetch organizations: ${error.message}`);
  }

  // Calculate engagement scores
  const scoresPromises = (organizations || []).map(async (org) => {
    const score = await calculateEngagementScore(org.id);
    return {
      organizationId: org.id,
      organizationName: org.name,
      accountManager: org.accountManager,
      engagementScore: score.score,
      lastInteractionDate: score.lastInteractionDate,
      riskLevel: score.riskLevel,
      trend: score.trend,
      factors: score.factors,
    };
  });

  const scores = await Promise.all(scoresPromises);

  // Filter by score range
  const filteredScores = scores.filter(s => 
    s.engagementScore >= minScore && s.engagementScore <= maxScore
  );

  // Sort by score (highest first)
  filteredScores.sort((a, b) => b.engagementScore - a.engagementScore);

  return new Response(
    JSON.stringify({
      data: filteredScores,
      total: filteredScores.length,
      averageScore: scores.reduce((sum, s) => sum + s.engagementScore, 0) / scores.length,
      distribution: calculateScoreDistribution(scores),
    }),
    { 
      status: 200, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    }
  );
}

/**
 * GET /organization-analytics/risk-assessment - Get organizations at risk
 */
async function getRiskAssessment(req: Request, url: URL, user: any) {
  const searchParams = url.searchParams;
  const riskLevel = searchParams.get('riskLevel'); // 'high', 'medium', 'low'
  const accountManager = searchParams.get('accountManager');
  
  // Get organizations with recent activity data
  const { data: organizations, error } = await supabaseAdmin
    .from('organizations')
    .select('id, name, accountManager, priorityId, updatedAt')
    .order('name');

  if (error) {
    throw new Error(`Failed to fetch organizations: ${error.message}`);
  }

  // Calculate risk assessment for each organization
  const riskAssessments = await Promise.all(
    (organizations || []).map(async (org) => {
      const risk = await calculateRiskAssessment(org.id);
      return {
        organizationId: org.id,
        organizationName: org.name,
        accountManager: org.accountManager,
        riskLevel: risk.level,
        riskScore: risk.score,
        riskFactors: risk.factors,
        recommendations: risk.recommendations,
        lastInteractionDate: risk.lastInteractionDate,
        daysSinceLastInteraction: risk.daysSinceLastInteraction,
        engagementTrend: risk.engagementTrend,
        pipelineHealth: risk.pipelineHealth,
      };
    })
  );

  // Filter by risk level if specified
  let filteredAssessments = riskAssessments;
  if (riskLevel) {
    filteredAssessments = riskAssessments.filter(r => r.riskLevel === riskLevel);
  }

  if (accountManager) {
    filteredAssessments = filteredAssessments.filter(r => r.accountManager === accountManager);
  }

  // Sort by risk score (highest risk first)
  filteredAssessments.sort((a, b) => b.riskScore - a.riskScore);

  return new Response(
    JSON.stringify({
      data: filteredAssessments,
      total: filteredAssessments.length,
      summary: {
        highRisk: riskAssessments.filter(r => r.riskLevel === 'high').length,
        mediumRisk: riskAssessments.filter(r => r.riskLevel === 'medium').length,
        lowRisk: riskAssessments.filter(r => r.riskLevel === 'low').length,
      },
    }),
    { 
      status: 200, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    }
  );
}

/**
 * GET /organization-analytics/opportunities - Get high-opportunity organizations
 */
async function getOpportunities(req: Request, url: URL, user: any) {
  const searchParams = url.searchParams;
  const minScore = parseFloat(searchParams.get('minOpportunityScore') || '70');
  const accountManager = searchParams.get('accountManager');
  
  // Get organizations
  const { data: organizations, error } = await supabaseAdmin
    .from('organizations')
    .select('id, name, accountManager, priorityId, segmentId')
    .order('name');

  if (error) {
    throw new Error(`Failed to fetch organizations: ${error.message}`);
  }

  // Calculate opportunities for each organization
  const opportunityPromises = (organizations || []).map(async (org) => {
    const opportunity = await calculateOpportunityScore(org.id);
    return {
      organizationId: org.id,
      organizationName: org.name,
      accountManager: org.accountManager,
      opportunityScore: opportunity.score,
      opportunityFactors: opportunity.factors,
      recommendedActions: opportunity.actions,
      potentialValue: opportunity.potentialValue,
      timeToClose: opportunity.timeToClose,
      confidenceLevel: opportunity.confidence,
      nextBestAction: opportunity.nextBestAction,
    };
  });

  const opportunities = await Promise.all(opportunityPromises);

  // Filter by opportunity score
  let filteredOpportunities = opportunities.filter(o => o.opportunityScore >= minScore);

  if (accountManager) {
    filteredOpportunities = filteredOpportunities.filter(o => o.accountManager === accountManager);
  }

  // Sort by opportunity score (highest first)
  filteredOpportunities.sort((a, b) => b.opportunityScore - a.opportunityScore);

  return new Response(
    JSON.stringify({
      data: filteredOpportunities,
      total: filteredOpportunities.length,
      totalPotentialValue: filteredOpportunities.reduce((sum, o) => sum + o.potentialValue, 0),
      averageTimeToClose: filteredOpportunities.reduce((sum, o) => sum + o.timeToClose, 0) / filteredOpportunities.length,
    }),
    { 
      status: 200, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    }
  );
}

/**
 * GET /organization-analytics/performance-trends - Get performance trends over time
 */
async function getPerformanceTrends(req: Request, url: URL, user: any) {
  const searchParams = url.searchParams;
  const period = searchParams.get('period') || '12'; // months
  const accountManager = searchParams.get('accountManager');
  
  const months = parseInt(period);
  const startDate = new Date();
  startDate.setMonth(startDate.getMonth() - months);

  // Get historical interaction data
  let interactionQuery = supabaseAdmin
    .from('interactions')
    .select(`
      id, organizationId, scheduledDate, createdAt, 
      outcome, typeId, isCompleted
    `)
    .gte('scheduledDate', startDate.toISOString())
    .order('scheduledDate');

  const { data: interactions, error: interactionError } = await interactionQuery;

  if (interactionError) {
    throw new Error(`Failed to fetch interactions: ${interactionError.message}`);
  }

  // Get historical deal data
  const { data: deals, error: dealError } = await supabaseAdmin
    .from('deals')
    .select('id, organizationId, createdAt, amount, stage, status')
    .gte('createdAt', startDate.toISOString())
    .order('createdAt');

  if (dealError) {
    throw new Error(`Failed to fetch deals: ${dealError.message}`);
  }

  // Calculate monthly trends
  const trends = calculateMonthlyTrends(interactions || [], deals || [], months);

  return new Response(
    JSON.stringify({
      data: trends,
      period: `${months} months`,
      startDate: startDate.toISOString(),
      endDate: new Date().toISOString(),
    }),
    { 
      status: 200, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    }
  );
}

/**
 * Calculate comprehensive organization metrics
 */
async function calculateOrganizationMetrics(organizationId: number) {
  // Get interactions for this organization
  const { data: interactions } = await supabaseAdmin
    .from('interactions')
    .select('*')
    .eq('organizationId', organizationId)
    .order('scheduledDate', { ascending: false });

  // Get deals for this organization
  const { data: deals } = await supabaseAdmin
    .from('deals')
    .select('*')
    .eq('organizationId', organizationId);

  // Get contacts count
  const { count: contactCount } = await supabaseAdmin
    .from('contacts')
    .select('*', { count: 'exact', head: true })
    .eq('organizationId', organizationId);

  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);

  // Calculate engagement score
  const lastInteraction = interactions?.[0];
  const daysSinceLastInteraction = lastInteraction 
    ? Math.floor((now.getTime() - new Date(lastInteraction.scheduledDate || lastInteraction.createdAt).getTime()) / (1000 * 60 * 60 * 24))
    : 365;

  let engagementScore = Math.max(0, 100 - daysSinceLastInteraction * 2);
  engagementScore += Math.min(30, (interactions?.length || 0) * 2);
  engagementScore = Math.min(100, engagementScore);

  // Calculate interaction trends
  const recentInteractions = (interactions || []).filter(i => 
    new Date(i.scheduledDate || i.createdAt) >= thirtyDaysAgo
  );
  const previousInteractions = (interactions || []).filter(i => {
    const date = new Date(i.scheduledDate || i.createdAt);
    return date >= ninetyDaysAgo && date < thirtyDaysAgo;
  });

  let interactionTrend: 'increasing' | 'decreasing' | 'stable' = 'stable';
  if (recentInteractions.length > previousInteractions.length * 1.2) {
    interactionTrend = 'increasing';
  } else if (recentInteractions.length < previousInteractions.length * 0.8) {
    interactionTrend = 'decreasing';
  }

  // Calculate pipeline metrics
  const activeDeals = (deals || []).filter(d => d.status === 'active');
  const totalPipelineValue = activeDeals.reduce((sum, deal) => sum + (deal.amount || 0), 0);
  const averageCloseRate = activeDeals.length > 0 
    ? activeDeals.reduce((sum, deal) => sum + (deal.probability || 0), 0) / activeDeals.length
    : 0;

  // Risk assessment
  const riskFactors: string[] = [];
  if (daysSinceLastInteraction > 30) riskFactors.push('No recent interactions');
  if (activeDeals.length === 0) riskFactors.push('No active pipeline');
  if (averageCloseRate < 25) riskFactors.push('Low deal probability');
  if (interactionTrend === 'decreasing') riskFactors.push('Declining engagement');

  // Opportunity identification
  const opportunities: string[] = [];
  if (interactionTrend === 'increasing') opportunities.push('Increasing engagement');
  if (averageCloseRate > 75) opportunities.push('High-probability deals');
  if (totalPipelineValue > 50000) opportunities.push('High-value pipeline');
  if ((interactions || []).filter(i => i.outcome === 'positive').length > 3) {
    opportunities.push('Positive interaction history');
  }

  return {
    engagementScore,
    interactionCount: interactions?.length || 0,
    contactCount: contactCount || 0,
    lastInteractionDate: lastInteraction?.scheduledDate || lastInteraction?.createdAt,
    daysSinceLastInteraction,
    interactionTrend,
    pipelineHealth: {
      activeDeals: activeDeals.length,
      totalValue: totalPipelineValue,
      averageCloseRate,
      estimatedCloseDate: calculateEstimatedCloseDate(activeDeals),
    },
    riskLevel: riskFactors.length > 2 ? 'high' : riskFactors.length > 0 ? 'medium' : 'low',
    riskFactors,
    opportunities,
    score: calculateOverallScore(engagementScore, activeDeals.length, averageCloseRate),
  };
}

/**
 * Calculate engagement score for an organization
 */
async function calculateEngagementScore(organizationId: number) {
  const { data: interactions } = await supabaseAdmin
    .from('interactions')
    .select('*')
    .eq('organizationId', organizationId)
    .order('scheduledDate', { ascending: false })
    .limit(50);

  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

  const lastInteraction = interactions?.[0];
  const daysSinceLastInteraction = lastInteraction 
    ? Math.floor((now.getTime() - new Date(lastInteraction.scheduledDate || lastInteraction.createdAt).getTime()) / (1000 * 60 * 60 * 24))
    : 365;

  // Base score calculation
  let score = Math.max(0, 100 - daysSinceLastInteraction * 2);
  
  // Activity bonus
  const recentInteractions = (interactions || []).filter(i => 
    new Date(i.scheduledDate || i.createdAt) >= thirtyDaysAgo
  );
  const previousInteractions = (interactions || []).filter(i => {
    const date = new Date(i.scheduledDate || i.createdAt);
    return date >= sixtyDaysAgo && date < thirtyDaysAgo;
  });

  score += Math.min(20, recentInteractions.length * 5);

  // Quality bonus
  const positiveOutcomes = (interactions || []).filter(i => i.outcome === 'positive').length;
  score += Math.min(10, positiveOutcomes * 2);

  score = Math.min(100, score);

  // Determine trend
  let trend: 'improving' | 'declining' | 'stable' = 'stable';
  if (recentInteractions.length > previousInteractions.length * 1.2) {
    trend = 'improving';
  } else if (recentInteractions.length < previousInteractions.length * 0.8) {
    trend = 'declining';
  }

  // Risk level
  let riskLevel: 'low' | 'medium' | 'high' = 'low';
  if (score < 30) riskLevel = 'high';
  else if (score < 60) riskLevel = 'medium';

  return {
    score,
    lastInteractionDate: lastInteraction?.scheduledDate || lastInteraction?.createdAt,
    riskLevel,
    trend,
    factors: {
      daysSinceLastInteraction,
      recentInteractionCount: recentInteractions.length,
      positiveOutcomes,
      totalInteractions: interactions?.length || 0,
    },
  };
}

/**
 * Calculate risk assessment for an organization
 */
async function calculateRiskAssessment(organizationId: number) {
  const metrics = await calculateOrganizationMetrics(organizationId);
  
  let riskScore = 0;
  const factors: string[] = [];
  const recommendations: string[] = [];

  // Time-based risk factors
  if (metrics.daysSinceLastInteraction > 60) {
    riskScore += 40;
    factors.push('No contact in 60+ days');
    recommendations.push('Schedule immediate follow-up call');
  } else if (metrics.daysSinceLastInteraction > 30) {
    riskScore += 20;
    factors.push('No recent contact');
    recommendations.push('Plan outreach within 7 days');
  }

  // Engagement trend risk
  if (metrics.interactionTrend === 'decreasing') {
    riskScore += 25;
    factors.push('Declining engagement');
    recommendations.push('Investigate engagement issues');
  }

  // Pipeline risk
  if (metrics.pipelineHealth.activeDeals === 0) {
    riskScore += 20;
    factors.push('No active opportunities');
    recommendations.push('Explore new opportunity development');
  } else if (metrics.pipelineHealth.averageCloseRate < 25) {
    riskScore += 15;
    factors.push('Low deal probability');
    recommendations.push('Review and strengthen deal qualification');
  }

  // Contact coverage risk
  if (metrics.contactCount < 2) {
    riskScore += 10;
    factors.push('Limited contact coverage');
    recommendations.push('Expand contact network within organization');
  }

  let level: 'low' | 'medium' | 'high' = 'low';
  if (riskScore >= 60) level = 'high';
  else if (riskScore >= 30) level = 'medium';

  return {
    level,
    score: riskScore,
    factors,
    recommendations,
    lastInteractionDate: metrics.lastInteractionDate,
    daysSinceLastInteraction: metrics.daysSinceLastInteraction,
    engagementTrend: metrics.interactionTrend,
    pipelineHealth: metrics.pipelineHealth,
  };
}

/**
 * Calculate opportunity score for an organization
 */
async function calculateOpportunityScore(organizationId: number) {
  const metrics = await calculateOrganizationMetrics(organizationId);
  
  let score = 0;
  const factors: string[] = [];
  const actions: string[] = [];

  // Engagement factors
  if (metrics.engagementScore > 80) {
    score += 30;
    factors.push('High engagement score');
  }

  if (metrics.interactionTrend === 'increasing') {
    score += 25;
    factors.push('Increasing engagement trend');
    actions.push('Capitalize on momentum with proposal');
  }

  // Pipeline factors
  if (metrics.pipelineHealth.averageCloseRate > 75) {
    score += 30;
    factors.push('High-probability deals in pipeline');
    actions.push('Focus on deal acceleration');
  }

  if (metrics.pipelineHealth.totalValue > 100000) {
    score += 20;
    factors.push('High-value pipeline');
    actions.push('Ensure executive sponsorship');
  }

  // Relationship factors
  if (metrics.contactCount > 3) {
    score += 15;
    factors.push('Strong contact network');
    actions.push('Leverage champions for expansion');
  }

  // Historical success factors
  const positiveInteractions = metrics.opportunities.includes('Positive interaction history');
  if (positiveInteractions) {
    score += 10;
    factors.push('Positive interaction history');
  }

  // Calculate potential value and timeline
  const potentialValue = metrics.pipelineHealth.totalValue * (metrics.pipelineHealth.averageCloseRate / 100);
  const timeToClose = Math.max(30, 90 - (metrics.engagementScore * 0.6));

  let nextBestAction = 'Schedule discovery call';
  if (score > 70) nextBestAction = 'Present proposal';
  else if (score > 50) nextBestAction = 'Develop business case';
  else if (score > 30) nextBestAction = 'Qualify opportunity';

  return {
    score: Math.min(100, score),
    factors,
    actions,
    potentialValue,
    timeToClose,
    confidence: score > 70 ? 'high' : score > 40 ? 'medium' : 'low',
    nextBestAction,
  };
}

/**
 * Helper functions
 */
function calculateAggregateMetrics(organizations: any[]) {
  const totalOrgs = organizations.length;
  const avgEngagementScore = organizations.reduce((sum, org) => sum + org.analytics.engagementScore, 0) / totalOrgs;
  
  const riskDistribution = organizations.reduce((acc, org) => {
    acc[org.analytics.riskLevel] = (acc[org.analytics.riskLevel] || 0) + 1;
    return acc;
  }, {});

  const totalPipelineValue = organizations.reduce((sum, org) => sum + org.analytics.pipelineHealth.totalValue, 0);

  return {
    totalOrganizations: totalOrgs,
    averageEngagementScore: avgEngagementScore,
    riskDistribution,
    totalPipelineValue,
    organizationsAtRisk: riskDistribution.high || 0,
    highOpportunityCount: organizations.filter(org => org.analytics.score > 70).length,
  };
}

function calculateScoreDistribution(scores: any[]) {
  const ranges = { '0-25': 0, '26-50': 0, '51-75': 0, '76-100': 0 };
  
  scores.forEach(s => {
    if (s.engagementScore <= 25) ranges['0-25']++;
    else if (s.engagementScore <= 50) ranges['26-50']++;
    else if (s.engagementScore <= 75) ranges['51-75']++;
    else ranges['76-100']++;
  });

  return ranges;
}

function calculateMonthlyTrends(interactions: any[], deals: any[], months: number) {
  const trends = [];
  
  for (let i = 0; i < months; i++) {
    const date = new Date();
    date.setMonth(date.getMonth() - i);
    const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
    const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0);

    const monthInteractions = interactions.filter(interaction => {
      const interactionDate = new Date(interaction.scheduledDate || interaction.createdAt);
      return interactionDate >= monthStart && interactionDate <= monthEnd;
    });

    const monthDeals = deals.filter(deal => {
      const dealDate = new Date(deal.createdAt);
      return dealDate >= monthStart && dealDate <= monthEnd;
    });

    trends.unshift({
      month: date.toISOString().slice(0, 7), // YYYY-MM format
      interactionCount: monthInteractions.length,
      dealCount: monthDeals.length,
      dealValue: monthDeals.reduce((sum, deal) => sum + (deal.amount || 0), 0),
      positiveOutcomes: monthInteractions.filter(i => i.outcome === 'positive').length,
    });
  }

  return trends;
}

function calculateEstimatedCloseDate(deals: any[]) {
  if (deals.length === 0) return null;
  
  // Simple estimation based on average close time (could be more sophisticated)
  const avgDaysToClose = 45;
  const soonestDate = new Date();
  soonestDate.setDate(soonestDate.getDate() + avgDaysToClose);
  
  return soonestDate.toISOString();
}

function calculateOverallScore(engagementScore: number, dealCount: number, avgCloseRate: number) {
  return Math.round(
    (engagementScore * 0.5) + 
    (Math.min(dealCount * 10, 30) * 0.3) + 
    (avgCloseRate * 0.2)
  );
}

// Additional endpoint implementations would be added here...
async function getPredictiveInsights(req: Request, url: URL, user: any) {
  // Placeholder for predictive insights implementation
  return new Response(
    JSON.stringify({ 
      message: 'Predictive insights endpoint - to be implemented with ML models' 
    }),
    { 
      status: 200, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    }
  );
}

async function getAnalyticsDashboard(req: Request, url: URL, user: any) {
  // Placeholder for analytics dashboard implementation
  return new Response(
    JSON.stringify({ 
      message: 'Analytics dashboard endpoint - to be implemented' 
    }),
    { 
      status: 200, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    }
  );
}

async function getBenchmarks(req: Request, url: URL, user: any) {
  // Placeholder for benchmarks implementation
  return new Response(
    JSON.stringify({ 
      message: 'Benchmarks endpoint - to be implemented' 
    }),
    { 
      status: 200, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    }
  );
}

async function calculateAllEngagementScores(req: Request, url: URL, user: any) {
  // Placeholder for batch score calculation
  return new Response(
    JSON.stringify({ 
      message: 'Batch engagement score calculation - to be implemented' 
    }),
    { 
      status: 200, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    }
  );
}

async function refreshPredictiveInsights(req: Request, url: URL, user: any) {
  // Placeholder for predictive insights refresh
  return new Response(
    JSON.stringify({ 
      message: 'Predictive insights refresh - to be implemented' 
    }),
    { 
      status: 200, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    }
  );
}