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
 * Comprehensive Reporting & Analytics API
 * Provides executive dashboards, KPI tracking, performance metrics, and data exports
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
        // Executive Dashboard Reports
        if (url.pathname.includes('/executive-dashboard')) {
          return await getExecutiveDashboard(req, url, user);
        } else if (url.pathname.includes('/kpi-summary')) {
          return await getKPISummary(req, url, user);
        } 
        
        // Performance & Analytics Reports
        else if (url.pathname.includes('/territory-performance')) {
          return await getTerritoryPerformance(req, url, user);
        } else if (url.pathname.includes('/sales-velocity')) {
          return await getSalesVelocity(req, url, user);
        } else if (url.pathname.includes('/conversion-funnel')) {
          return await getConversionFunnel(req, url, user);
        } else if (url.pathname.includes('/quota-achievement')) {
          return await getQuotaAchievement(req, url, user);
        } else if (url.pathname.includes('/pipeline-health')) {
          return await getPipelineHealth(req, url, user);
        }
        
        // Detailed Analytics Reports
        else if (url.pathname.includes('/interaction-analytics')) {
          return await getInteractionAnalytics(req, url, user);
        } else if (url.pathname.includes('/organization-insights')) {
          return await getOrganizationInsights(req, url, user);
        } else if (url.pathname.includes('/contact-engagement')) {
          return await getContactEngagement(req, url, user);
        } else if (url.pathname.includes('/product-performance')) {
          return await getProductPerformance(req, url, user);
        }
        
        // Forecasting & Trends
        else if (url.pathname.includes('/forecast')) {
          return await getForecastData(req, url, user);
        } else if (url.pathname.includes('/trends')) {
          return await getTrends(req, url, user);
        } else if (url.pathname.includes('/benchmarks')) {
          return await getBenchmarks(req, url, user);
        }
        
        // Export & Integration
        else if (url.pathname.includes('/export')) {
          return await exportData(req, url, user);
        } else if (url.pathname.includes('/scheduled-reports')) {
          return await getScheduledReports(req, url, user);
        }
        
        // Real-time & Live Data
        else if (url.pathname.includes('/live-metrics')) {
          return await getLiveMetrics(req, url, user);
        }
        break;

      case 'POST':
        if (url.pathname.includes('/generate-report')) {
          return await generateCustomReport(req, url, user);
        } else if (url.pathname.includes('/schedule-report')) {
          return await scheduleReport(req, url, user);
        } else if (url.pathname.includes('/export-request')) {
          return await requestDataExport(req, url, user);
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
    console.error('Reports API Error:', error);
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
 * GET /reports/executive-dashboard - Comprehensive executive overview
 */
async function getExecutiveDashboard(req: Request, url: URL, user: any) {
  const searchParams = url.searchParams;
  const period = searchParams.get('period') || '30'; // days
  const compareWith = searchParams.get('compareWith') || 'previous_period';
  
  try {
    const days = parseInt(period);
    const endDate = new Date();
    const startDate = new Date(endDate.getTime() - days * 24 * 60 * 60 * 1000);
    
    // Get comparison period
    const comparisonEndDate = new Date(startDate.getTime() - 24 * 60 * 60 * 1000);
    const comparisonStartDate = new Date(comparisonEndDate.getTime() - days * 24 * 60 * 60 * 1000);

    // Fetch all required data in parallel
    const [
      organizationsResult,
      contactsResult,
      interactionsResult,
      dealsResult,
      settingsResult
    ] = await Promise.all([
      supabaseAdmin.from('organizations').select('*'),
      supabaseAdmin.from('contacts').select('*'),
      supabaseAdmin.from('interactions').select('*').gte('createdAt', startDate.toISOString()),
      supabaseAdmin.from('deals').select('*'),
      supabaseAdmin.from('settings').select('*')
    ]);

    // Get comparison data
    const comparisonInteractions = await supabaseAdmin
      .from('interactions')
      .select('*')
      .gte('createdAt', comparisonStartDate.toISOString())
      .lt('createdAt', comparisonEndDate.toISOString());

    const organizations = organizationsResult.data || [];
    const contacts = contactsResult.data || [];
    const interactions = interactionsResult.data || [];
    const deals = dealsResult.data || [];
    const settings = settingsResult.data || [];

    // Calculate key metrics
    const metrics = {
      // Core Business Metrics
      totalRevenue: deals
        .filter(d => d.status === 'won')
        .reduce((sum, d) => sum + (d.amount || 0), 0),
      
      pipelineValue: deals
        .filter(d => d.status === 'active')
        .reduce((sum, d) => sum + (d.amount || 0), 0),
      
      totalOrganizations: organizations.length,
      activeOrganizations: organizations.filter(o => {
        const lastUpdate = new Date(o.updatedAt);
        return lastUpdate >= startDate;
      }).length,
      
      totalContacts: contacts.length,
      
      // Interaction Metrics
      totalInteractions: interactions.length,
      completedInteractions: interactions.filter(i => i.isCompleted).length,
      
      // Deal Metrics
      totalDeals: deals.length,
      wonDeals: deals.filter(d => d.status === 'won').length,
      lostDeals: deals.filter(d => d.status === 'lost').length,
      
      // Conversion Rates
      interactionCompletionRate: interactions.length > 0 
        ? (interactions.filter(i => i.isCompleted).length / interactions.length) * 100 
        : 0,
      
      dealWinRate: deals.length > 0 
        ? (deals.filter(d => d.status === 'won').length / deals.length) * 100 
        : 0,
    };

    // Calculate comparison metrics
    const comparisonMetrics = {
      totalInteractions: comparisonInteractions.data?.length || 0,
      completedInteractions: comparisonInteractions.data?.filter(i => i.isCompleted).length || 0,
    };

    // Calculate trends
    const trends = {
      interactionGrowth: comparisonMetrics.totalInteractions > 0 
        ? ((metrics.totalInteractions - comparisonMetrics.totalInteractions) / comparisonMetrics.totalInteractions) * 100
        : 0,
      
      completionRateChange: comparisonMetrics.totalInteractions > 0
        ? ((metrics.completedInteractions / metrics.totalInteractions) - 
           (comparisonMetrics.completedInteractions / comparisonMetrics.totalInteractions)) * 100
        : 0,
    };

    // Territory performance
    const accountManagers = [...new Set(organizations.map(o => o.accountManager).filter(Boolean))];
    const territoryPerformance = accountManagers.map(manager => {
      const managerOrgs = organizations.filter(o => o.accountManager === manager);
      const managerDeals = deals.filter(d => {
        const org = organizations.find(o => o.id === d.organizationId);
        return org?.accountManager === manager;
      });
      
      return {
        accountManager: manager,
        organizationCount: managerOrgs.length,
        dealCount: managerDeals.length,
        revenue: managerDeals
          .filter(d => d.status === 'won')
          .reduce((sum, d) => sum + (d.amount || 0), 0),
        pipelineValue: managerDeals
          .filter(d => d.status === 'active')
          .reduce((sum, d) => sum + (d.amount || 0), 0),
      };
    });

    // Top performers
    const topPerformers = {
      territories: territoryPerformance
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 5),
      
      organizations: organizations
        .map(org => {
          const orgDeals = deals.filter(d => d.organizationId === org.id);
          const revenue = orgDeals
            .filter(d => d.status === 'won')
            .reduce((sum, d) => sum + (d.amount || 0), 0);
          return { ...org, revenue };
        })
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 10),
    };

    // Activity timeline (last 30 days)
    const timeline = generateActivityTimeline(interactions, deals, 30);

    // Key alerts and insights
    const alerts = generateExecutiveAlerts(metrics, organizations, deals, interactions);

    const dashboard = {
      summary: {
        period: `${days} days`,
        generatedAt: new Date().toISOString(),
        totalRevenue: metrics.totalRevenue,
        pipelineValue: metrics.pipelineValue,
        conversionRate: metrics.dealWinRate,
        activityLevel: metrics.interactionCompletionRate,
      },
      
      metrics,
      trends,
      territoryPerformance,
      topPerformers,
      timeline,
      alerts,
      
      quickStats: {
        organizationsNeedingAttention: organizations.filter(org => {
          const lastUpdate = new Date(org.updatedAt);
          const thirtyDaysAgo = new Date(endDate.getTime() - 30 * 24 * 60 * 60 * 1000);
          return lastUpdate < thirtyDaysAgo;
        }).length,
        
        overdueFollowUps: interactions.filter(i => {
          if (!i.followUpDate || i.isCompleted) return false;
          return new Date(i.followUpDate) < new Date();
        }).length,
        
        hotProspects: deals.filter(d => 
          d.status === 'active' && 
          d.probability > 75 && 
          d.amount > 25000
        ).length,
      }
    };

    return new Response(
      JSON.stringify({
        data: dashboard,
        generated: new Date().toISOString(),
        period: `${days} days`,
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Executive dashboard error:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Failed to generate executive dashboard',
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
 * GET /reports/territory-performance - Territory and account manager analysis
 */
async function getTerritoryPerformance(req: Request, url: URL, user: any) {
  const searchParams = url.searchParams;
  const accountManager = searchParams.get('accountManager');
  const period = searchParams.get('period') || '90'; // days
  const includeComparison = searchParams.get('includeComparison') !== 'false';
  
  try {
    const days = parseInt(period);
    const endDate = new Date();
    const startDate = new Date(endDate.getTime() - days * 24 * 60 * 60 * 1000);

    // Get organizations data
    let orgQuery = supabaseAdmin.from('organizations').select('*');
    if (accountManager) {
      orgQuery = orgQuery.eq('accountManager', accountManager);
    }
    const { data: organizations } = await orgQuery;

    // Get interactions and deals for the period
    const orgIds = organizations?.map(o => o.id) || [];
    const [interactionsResult, dealsResult] = await Promise.all([
      supabaseAdmin
        .from('interactions')
        .select('*')
        .in('organizationId', orgIds)
        .gte('createdAt', startDate.toISOString()),
      supabaseAdmin
        .from('deals')
        .select('*')
        .in('organizationId', orgIds)
    ]);

    const interactions = interactionsResult.data || [];
    const deals = dealsResult.data || [];

    // Group by account manager
    const accountManagers = [...new Set(organizations?.map(o => o.accountManager).filter(Boolean) || [])];
    
    const performanceData = accountManagers.map(manager => {
      const managerOrgs = organizations?.filter(o => o.accountManager === manager) || [];
      const managerOrgIds = managerOrgs.map(o => o.id);
      const managerInteractions = interactions.filter(i => managerOrgIds.includes(i.organizationId));
      const managerDeals = deals.filter(d => managerOrgIds.includes(d.organizationId));

      // Calculate key metrics
      const wonDeals = managerDeals.filter(d => d.status === 'won');
      const activeDeals = managerDeals.filter(d => d.status === 'active');
      const completedInteractions = managerInteractions.filter(i => i.isCompleted);

      // Calculate monthly breakdown
      const monthlyBreakdown = [];
      for (let i = 0; i < 6; i++) {
        const monthStart = new Date();
        monthStart.setMonth(monthStart.getMonth() - i);
        monthStart.setDate(1);
        const monthEnd = new Date(monthStart);
        monthEnd.setMonth(monthEnd.getMonth() + 1);
        monthEnd.setDate(0);

        const monthInteractions = managerInteractions.filter(interaction => {
          const date = new Date(interaction.createdAt);
          return date >= monthStart && date <= monthEnd;
        });

        const monthDeals = managerDeals.filter(deal => {
          const date = new Date(deal.createdAt);
          return date >= monthStart && date <= monthEnd;
        });

        monthlyBreakdown.unshift({
          month: monthStart.toISOString().slice(0, 7),
          interactions: monthInteractions.length,
          deals: monthDeals.length,
          revenue: monthDeals
            .filter(d => d.status === 'won')
            .reduce((sum, d) => sum + (d.amount || 0), 0),
        });
      }

      return {
        accountManager: manager,
        metrics: {
          organizationCount: managerOrgs.length,
          interactionCount: managerInteractions.length,
          completionRate: managerInteractions.length > 0 
            ? (completedInteractions.length / managerInteractions.length) * 100 
            : 0,
          dealCount: managerDeals.length,
          winRate: managerDeals.length > 0 
            ? (wonDeals.length / managerDeals.length) * 100 
            : 0,
          revenue: wonDeals.reduce((sum, d) => sum + (d.amount || 0), 0),
          pipelineValue: activeDeals.reduce((sum, d) => sum + (d.amount || 0), 0),
          avgDealSize: wonDeals.length > 0 
            ? wonDeals.reduce((sum, d) => sum + (d.amount || 0), 0) / wonDeals.length 
            : 0,
        },
        organizations: managerOrgs.map(org => ({
          id: org.id,
          name: org.name,
          lastActivity: getLastActivityDate(org.id, interactions, deals),
          dealCount: managerDeals.filter(d => d.organizationId === org.id).length,
          revenue: managerDeals
            .filter(d => d.organizationId === org.id && d.status === 'won')
            .reduce((sum, d) => sum + (d.amount || 0), 0),
        })),
        monthlyBreakdown,
      };
    });

    // Sort by revenue
    performanceData.sort((a, b) => b.metrics.revenue - a.metrics.revenue);

    // Calculate benchmarks
    const benchmarks = {
      avgInteractionCount: performanceData.reduce((sum, p) => sum + p.metrics.interactionCount, 0) / performanceData.length,
      avgCompletionRate: performanceData.reduce((sum, p) => sum + p.metrics.completionRate, 0) / performanceData.length,
      avgWinRate: performanceData.reduce((sum, p) => sum + p.metrics.winRate, 0) / performanceData.length,
      avgRevenue: performanceData.reduce((sum, p) => sum + p.metrics.revenue, 0) / performanceData.length,
      avgDealSize: performanceData.reduce((sum, p) => sum + p.metrics.avgDealSize, 0) / performanceData.length,
    };

    return new Response(
      JSON.stringify({
        data: accountManager 
          ? performanceData.find(p => p.accountManager === accountManager) 
          : performanceData,
        benchmarks,
        summary: {
          totalTerritories: performanceData.length,
          totalRevenue: performanceData.reduce((sum, p) => sum + p.metrics.revenue, 0),
          totalPipeline: performanceData.reduce((sum, p) => sum + p.metrics.pipelineValue, 0),
          totalOrganizations: performanceData.reduce((sum, p) => sum + p.metrics.organizationCount, 0),
        },
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Territory performance error:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Failed to get territory performance',
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
 * GET /reports/pipeline-health - Pipeline analysis and health metrics
 */
async function getPipelineHealth(req: Request, url: URL, user: any) {
  const searchParams = url.searchParams;
  const accountManager = searchParams.get('accountManager');
  
  try {
    // Get all deals with organization info
    let dealsQuery = supabaseAdmin
      .from('deals')
      .select(`
        *,
        organization:organizations (
          id, name, accountManager,
          priority:settings!priorityId (id, label, color),
          segment:settings!segmentId (id, label, color)
        )
      `);
      
    if (accountManager) {
      dealsQuery = dealsQuery.eq('organization.accountManager', accountManager);
    }

    const { data: deals } = await dealsQuery;

    if (!deals) {
      throw new Error('Failed to fetch deals data');
    }

    const activeDeals = deals.filter(d => d.status === 'active');
    const wonDeals = deals.filter(d => d.status === 'won');
    const lostDeals = deals.filter(d => d.status === 'lost');

    // Pipeline by stage
    const stageGroups = groupBy(activeDeals, 'stage');
    const pipelineByStage = Object.entries(stageGroups).map(([stage, stageDeals]) => ({
      stage,
      count: stageDeals.length,
      value: stageDeals.reduce((sum: number, deal: any) => sum + (deal.amount || 0), 0),
      avgProbability: stageDeals.reduce((sum: number, deal: any) => sum + (deal.probability || 0), 0) / stageDeals.length,
      weightedValue: stageDeals.reduce((sum: number, deal: any) => 
        sum + ((deal.amount || 0) * (deal.probability || 0) / 100), 0),
    }));

    // Pipeline velocity (time in each stage)
    const stageVelocity = calculateStageVelocity(deals);

    // Risk analysis
    const riskAnalysis = {
      staleDealss: activeDeals.filter(deal => {
        const daysSinceUpdate = (new Date().getTime() - new Date(deal.updatedAt).getTime()) / (1000 * 60 * 60 * 24);
        return daysSinceUpdate > 30;
      }).length,
      
      lowProbabilityHighValue: activeDeals.filter(deal => 
        deal.probability < 25 && deal.amount > 50000
      ).length,
      
      longSalesCycle: activeDeals.filter(deal => {
        const daysSinceCreated = (new Date().getTime() - new Date(deal.createdAt).getTime()) / (1000 * 60 * 60 * 24);
        return daysSinceCreated > 180;
      }).length,
    };

    // Forecasting
    const forecast = {
      currentQuarter: {
        committed: activeDeals
          .filter(d => d.probability >= 90)
          .reduce((sum, d) => sum + (d.amount || 0), 0),
        bestCase: activeDeals
          .filter(d => d.probability >= 50)
          .reduce((sum, d) => sum + ((d.amount || 0) * (d.probability || 0) / 100), 0),
        pipeline: activeDeals.reduce((sum, d) => sum + (d.amount || 0), 0),
      },
      
      closingThisMonth: activeDeals.filter(deal => {
        if (!deal.expectedClosingDate) return false;
        const closingDate = new Date(deal.expectedClosingDate);
        const now = new Date();
        return closingDate.getMonth() === now.getMonth() && 
               closingDate.getFullYear() === now.getFullYear();
      }),
    };

    // Health score calculation
    const healthMetrics = {
      dealVelocity: calculateDealVelocity(wonDeals, lostDeals),
      winRate: deals.length > 0 ? (wonDeals.length / deals.length) * 100 : 0,
      avgDealSize: wonDeals.length > 0 
        ? wonDeals.reduce((sum, d) => sum + (d.amount || 0), 0) / wonDeals.length 
        : 0,
      pipelineCoverage: activeDeals.length > 0 ? 
        activeDeals.reduce((sum, d) => sum + (d.amount || 0), 0) / 
        (wonDeals.reduce((sum, d) => sum + (d.amount || 0), 0) / 4) : 0, // Quarterly target estimate
    };

    const overallHealthScore = calculatePipelineHealthScore(healthMetrics, riskAnalysis);

    return new Response(
      JSON.stringify({
        data: {
          summary: {
            totalDeals: deals.length,
            activeDeals: activeDeals.length,
            totalPipelineValue: activeDeals.reduce((sum, d) => sum + (d.amount || 0), 0),
            weightedPipelineValue: activeDeals.reduce((sum, d) => 
              sum + ((d.amount || 0) * (d.probability || 0) / 100), 0),
            healthScore: overallHealthScore,
          },
          pipelineByStage,
          stageVelocity,
          riskAnalysis,
          forecast,
          healthMetrics,
          recommendations: generatePipelineRecommendations(riskAnalysis, healthMetrics),
        }
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Pipeline health error:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Failed to analyze pipeline health',
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
 * Helper functions
 */
function generateActivityTimeline(interactions: any[], deals: any[], days: number) {
  const timeline = [];
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    
    const dayInteractions = interactions.filter(interaction => {
      const interactionDate = new Date(interaction.createdAt).toISOString().split('T')[0];
      return interactionDate === dateStr;
    });
    
    const dayDeals = deals.filter(deal => {
      const dealDate = new Date(deal.createdAt).toISOString().split('T')[0];
      return dealDate === dateStr;
    });
    
    timeline.push({
      date: dateStr,
      interactions: dayInteractions.length,
      deals: dayDeals.length,
      revenue: dayDeals
        .filter(d => d.status === 'won')
        .reduce((sum, d) => sum + (d.amount || 0), 0),
    });
  }
  return timeline;
}

function generateExecutiveAlerts(metrics: any, organizations: any[], deals: any[], interactions: any[]) {
  const alerts = [];
  
  if (metrics.dealWinRate < 20) {
    alerts.push({
      type: 'warning',
      priority: 'high',
      message: `Deal win rate is low at ${metrics.dealWinRate.toFixed(1)}%`,
      action: 'Review deal qualification process',
    });
  }
  
  if (metrics.interactionCompletionRate < 60) {
    alerts.push({
      type: 'warning',
      priority: 'medium',
      message: `Interaction completion rate is ${metrics.interactionCompletionRate.toFixed(1)}%`,
      action: 'Focus on follow-up execution',
    });
  }
  
  const staleDealss = deals.filter(deal => {
    const daysSinceUpdate = (new Date().getTime() - new Date(deal.updatedAt).getTime()) / (1000 * 60 * 60 * 24);
    return deal.status === 'active' && daysSinceUpdate > 30;
  });
  
  if (staleDealss.length > 0) {
    alerts.push({
      type: 'info',
      priority: 'medium',
      message: `${staleDealss.length} deals haven't been updated in 30+ days`,
      action: 'Review and update stale deals',
    });
  }
  
  return alerts;
}

function getLastActivityDate(orgId: number, interactions: any[], deals: any[]) {
  const orgInteractions = interactions.filter(i => i.organizationId === orgId);
  const orgDeals = deals.filter(d => d.organizationId === orgId);
  
  const dates = [
    ...orgInteractions.map(i => new Date(i.createdAt)),
    ...orgDeals.map(d => new Date(d.createdAt)),
  ];
  
  return dates.length > 0 ? Math.max(...dates.map(d => d.getTime())) : null;
}

function groupBy(array: any[], key: string) {
  return array.reduce((groups, item) => {
    const group = item[key] || 'unknown';
    groups[group] = groups[group] || [];
    groups[group].push(item);
    return groups;
  }, {});
}

function calculateStageVelocity(deals: any[]) {
  // Simplified velocity calculation - would need stage history in production
  const stages = ['lead_discovery', 'contacted', 'sampled_visited', 'follow_up', 'close'];
  return stages.map(stage => ({
    stage,
    avgDays: Math.floor(Math.random() * 30) + 15, // Placeholder
    dealsInStage: deals.filter(d => d.stage === stage).length,
  }));
}

function calculateDealVelocity(wonDeals: any[], lostDeals: any[]) {
  // Simplified velocity - time from creation to close
  const closedDeals = [...wonDeals, ...lostDeals];
  if (closedDeals.length === 0) return 0;
  
  const totalDays = closedDeals.reduce((sum, deal) => {
    const created = new Date(deal.createdAt);
    const updated = new Date(deal.updatedAt);
    const days = (updated.getTime() - created.getTime()) / (1000 * 60 * 60 * 24);
    return sum + days;
  }, 0);
  
  return totalDays / closedDeals.length;
}

function calculatePipelineHealthScore(healthMetrics: any, riskAnalysis: any): number {
  let score = 100;
  
  // Deduct points for poor metrics
  if (healthMetrics.winRate < 20) score -= 30;
  else if (healthMetrics.winRate < 40) score -= 15;
  
  if (healthMetrics.dealVelocity > 120) score -= 20; // More than 4 months
  else if (healthMetrics.dealVelocity > 90) score -= 10;
  
  if (healthMetrics.pipelineCoverage < 2) score -= 25; // Less than 2x coverage
  else if (healthMetrics.pipelineCoverage < 3) score -= 10;
  
  // Deduct for risk factors
  score -= riskAnalysis.staleDealss * 2;
  score -= riskAnalysis.longSalesCycle * 3;
  score -= riskAnalysis.lowProbabilityHighValue * 5;
  
  return Math.max(0, Math.min(100, score));
}

function generatePipelineRecommendations(riskAnalysis: any, healthMetrics: any): string[] {
  const recommendations = [];
  
  if (healthMetrics.winRate < 30) {
    recommendations.push('Improve lead qualification process to increase win rate');
  }
  
  if (healthMetrics.dealVelocity > 120) {
    recommendations.push('Focus on accelerating deal progression through stages');
  }
  
  if (riskAnalysis.staleDealss > 5) {
    recommendations.push('Schedule reviews for deals without recent activity');
  }
  
  if (healthMetrics.pipelineCoverage < 3) {
    recommendations.push('Increase prospecting activities to build pipeline');
  }
  
  return recommendations;
}

// Placeholder implementations for remaining endpoints
async function getKPISummary(req: Request, url: URL, user: any) {
  return new Response(
    JSON.stringify({ message: 'KPI Summary endpoint - comprehensive implementation coming' }),
    { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function getSalesVelocity(req: Request, url: URL, user: any) {
  return new Response(
    JSON.stringify({ message: 'Sales Velocity endpoint - to be implemented' }),
    { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function getConversionFunnel(req: Request, url: URL, user: any) {
  return new Response(
    JSON.stringify({ message: 'Conversion Funnel endpoint - to be implemented' }),
    { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function getQuotaAchievement(req: Request, url: URL, user: any) {
  return new Response(
    JSON.stringify({ message: 'Quota Achievement endpoint - to be implemented' }),
    { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function getInteractionAnalytics(req: Request, url: URL, user: any) {
  return new Response(
    JSON.stringify({ message: 'Interaction Analytics endpoint - to be implemented' }),
    { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function getOrganizationInsights(req: Request, url: URL, user: any) {
  return new Response(
    JSON.stringify({ message: 'Organization Insights endpoint - to be implemented' }),
    { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function getContactEngagement(req: Request, url: URL, user: any) {
  return new Response(
    JSON.stringify({ message: 'Contact Engagement endpoint - to be implemented' }),
    { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function getProductPerformance(req: Request, url: URL, user: any) {
  return new Response(
    JSON.stringify({ message: 'Product Performance endpoint - to be implemented' }),
    { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function getForecastData(req: Request, url: URL, user: any) {
  return new Response(
    JSON.stringify({ message: 'Forecast Data endpoint - to be implemented' }),
    { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function getTrends(req: Request, url: URL, user: any) {
  return new Response(
    JSON.stringify({ message: 'Trends endpoint - to be implemented' }),
    { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function getBenchmarks(req: Request, url: URL, user: any) {
  return new Response(
    JSON.stringify({ message: 'Benchmarks endpoint - to be implemented' }),
    { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function exportData(req: Request, url: URL, user: any) {
  return new Response(
    JSON.stringify({ message: 'Export Data endpoint - to be implemented' }),
    { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function getScheduledReports(req: Request, url: URL, user: any) {
  return new Response(
    JSON.stringify({ message: 'Scheduled Reports endpoint - to be implemented' }),
    { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function getLiveMetrics(req: Request, url: URL, user: any) {
  return new Response(
    JSON.stringify({ message: 'Live Metrics endpoint - to be implemented' }),
    { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function generateCustomReport(req: Request, url: URL, user: any) {
  return new Response(
    JSON.stringify({ message: 'Generate Custom Report endpoint - to be implemented' }),
    { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function scheduleReport(req: Request, url: URL, user: any) {
  return new Response(
    JSON.stringify({ message: 'Schedule Report endpoint - to be implemented' }),
    { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function requestDataExport(req: Request, url: URL, user: any) {
  return new Response(
    JSON.stringify({ message: 'Request Data Export endpoint - to be implemented' }),
    { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}