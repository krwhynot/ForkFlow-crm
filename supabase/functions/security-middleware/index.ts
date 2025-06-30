// supabase/functions/security-middleware/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Security middleware configuration
const SECURITY_CONFIG = {
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 100, // per window per IP
    maxLoginAttempts: 5, // per window per IP
  },
  security: {
    maxFailedAttempts: 5,
    lockoutDurationMs: 15 * 60 * 1000, // 15 minutes
    sessionTimeoutMs: 30 * 60 * 1000, // 30 minutes
    maxSessions: 3,
  },
  monitoring: {
    suspiciousPatterns: [
      /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION|SCRIPT)\b)/gi,
      /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
      /\.\.[\/\\]/g,
      /[;&|`$(){}[\]]/g,
    ],
    highRiskThreshold: 80,
    mediumRiskThreshold: 50,
  }
}

interface SecurityEvent {
  userId?: string
  userEmail?: string
  eventType: string
  eventCategory: string
  resource?: string
  resourceId?: string
  action: string
  ipAddress?: string
  userAgent?: string
  sessionId?: string
  deviceFingerprint?: string
  riskScore: number
  details: any
  success: boolean
  errorMessage?: string
}

interface RateLimitEntry {
  requests: number
  resetTime: number
  failedAttempts: number
}

// In-memory rate limiting store (in production, use Redis or similar)
const rateLimitStore = new Map<string, RateLimitEntry>()

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    const url = new URL(req.url)
    const action = url.searchParams.get('action')
    const clientIP = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown'
    const userAgent = req.headers.get('user-agent') || ''
    
    // Extract user info from JWT if available
    let userId: string | undefined
    let userEmail: string | undefined
    
    const authHeader = req.headers.get('Authorization')
    if (authHeader?.startsWith('Bearer ')) {
      try {
        const { data: { user } } = await supabaseClient.auth.getUser()
        userId = user?.id
        userEmail = user?.email
      } catch (error) {
        console.log('Could not extract user from token:', error)
      }
    }

    switch (action) {
      case 'rate_limit_check':
        return await handleRateLimitCheck(req, clientIP, userAgent)
      
      case 'log_security_event':
        return await handleLogSecurityEvent(req, supabaseClient)
      
      case 'validate_session':
        return await handleValidateSession(req, supabaseClient, userId)
      
      case 'check_suspicious_activity':
        return await handleCheckSuspiciousActivity(req, clientIP, userAgent)
      
      case 'update_security_metrics':
        return await handleUpdateSecurityMetrics(req, supabaseClient)
      
      default:
        return new Response(
          JSON.stringify({ error: 'Invalid action' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
    }
  } catch (error) {
    console.error('Security middleware error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

async function handleRateLimitCheck(req: Request, clientIP: string, userAgent: string) {
  const body = await req.json()
  const { identifier, endpoint, maxAttempts } = body
  
  const key = `${identifier || clientIP}_${endpoint || 'default'}`
  const now = Date.now()
  
  // Get or create rate limit entry
  let entry = rateLimitStore.get(key) || {
    requests: 0,
    resetTime: now + SECURITY_CONFIG.rateLimit.windowMs,
    failedAttempts: 0
  }
  
  // Reset if window expired
  if (now > entry.resetTime) {
    entry = {
      requests: 0,
      resetTime: now + SECURITY_CONFIG.rateLimit.windowMs,
      failedAttempts: 0
    }
  }
  
  // Determine appropriate limit
  const limit = endpoint === 'login' 
    ? SECURITY_CONFIG.rateLimit.maxLoginAttempts 
    : maxAttempts || SECURITY_CONFIG.rateLimit.maxRequests
  
  // Check if limit exceeded
  const allowed = entry.requests < limit
  
  if (allowed) {
    entry.requests++
    rateLimitStore.set(key, entry)
  }
  
  // Calculate risk score based on rate limiting
  let riskScore = 0
  if (!allowed) riskScore += 60
  if (entry.requests > limit * 0.8) riskScore += 20
  if (endpoint === 'login' && entry.failedAttempts > 0) riskScore += 30
  
  return new Response(
    JSON.stringify({
      allowed,
      limit,
      remaining: Math.max(0, limit - entry.requests),
      resetTime: entry.resetTime,
      riskScore
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function handleLogSecurityEvent(req: Request, supabaseClient: any) {
  const eventData: SecurityEvent = await req.json()
  
  // Validate required fields
  if (!eventData.eventType || !eventData.eventCategory || !eventData.action) {
    return new Response(
      JSON.stringify({ error: 'Missing required fields' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
  
  // Insert security event
  const { data, error } = await supabaseClient
    .from('security_events')
    .insert([{
      userId: eventData.userId,
      userEmail: eventData.userEmail,
      eventType: eventData.eventType,
      eventCategory: eventData.eventCategory,
      resource: eventData.resource,
      resourceId: eventData.resourceId,
      action: eventData.action,
      ipAddress: eventData.ipAddress,
      userAgent: eventData.userAgent,
      sessionId: eventData.sessionId,
      deviceFingerprint: eventData.deviceFingerprint,
      riskScore: eventData.riskScore || 0,
      details: eventData.details || {},
      success: eventData.success,
      errorMessage: eventData.errorMessage,
      createdAt: new Date().toISOString()
    }])
  
  if (error) {
    console.error('Failed to log security event:', error)
    return new Response(
      JSON.stringify({ error: 'Failed to log event' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
  
  // Check if this event triggers alerts
  if (eventData.riskScore >= SECURITY_CONFIG.monitoring.highRiskThreshold) {
    await triggerSecurityAlert(eventData, supabaseClient)
  }
  
  return new Response(
    JSON.stringify({ success: true, eventId: data?.[0]?.id }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function handleValidateSession(req: Request, supabaseClient: any, userId?: string) {
  const body = await req.json()
  const { sessionId, deviceFingerprint } = body
  
  if (!sessionId || !userId) {
    return new Response(
      JSON.stringify({ valid: false, reason: 'Missing session information' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
  
  // Check session in database
  const { data: session, error } = await supabaseClient
    .from('user_sessions')
    .select('*')
    .eq('id', sessionId)
    .eq('userId', userId)
    .eq('isActive', true)
    .single()
  
  if (error || !session) {
    return new Response(
      JSON.stringify({ valid: false, reason: 'Session not found' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
  
  // Check if session expired
  if (new Date(session.expiresAt) < new Date()) {
    // Mark session as expired
    await supabaseClient
      .from('user_sessions')
      .update({
        isActive: false,
        revokedAt: new Date().toISOString(),
        revokedReason: 'expired'
      })
      .eq('id', sessionId)
    
    return new Response(
      JSON.stringify({ valid: false, reason: 'Session expired' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
  
  // Update last activity
  await supabaseClient
    .from('user_sessions')
    .update({ lastActivity: new Date().toISOString() })
    .eq('id', sessionId)
  
  // Validate device fingerprint if provided
  let riskScore = 0
  if (deviceFingerprint && session.deviceFingerprint !== deviceFingerprint) {
    riskScore += 40 // Different device
  }
  
  return new Response(
    JSON.stringify({
      valid: true,
      session: {
        id: session.id,
        expiresAt: session.expiresAt,
        lastActivity: session.lastActivity,
        riskScore
      }
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function handleCheckSuspiciousActivity(req: Request, clientIP: string, userAgent: string) {
  const body = await req.json()
  const { userId, input, action, resource } = body
  
  let riskScore = 0
  const flags: string[] = []
  
  // Check for suspicious patterns in input
  if (input) {
    for (const pattern of SECURITY_CONFIG.monitoring.suspiciousPatterns) {
      if (pattern.test(input)) {
        riskScore += 50
        flags.push('suspicious_input_pattern')
        break
      }
    }
  }
  
  // Check rate limiting history
  const rateLimitKey = `${userId || clientIP}_${action || 'default'}`
  const rateLimitEntry = rateLimitStore.get(rateLimitKey)
  
  if (rateLimitEntry) {
    const usageRatio = rateLimitEntry.requests / SECURITY_CONFIG.rateLimit.maxRequests
    if (usageRatio > 0.8) {
      riskScore += Math.floor(usageRatio * 30)
      flags.push('high_request_rate')
    }
    
    if (rateLimitEntry.failedAttempts > 2) {
      riskScore += rateLimitEntry.failedAttempts * 10
      flags.push('multiple_failures')
    }
  }
  
  // Check user agent
  if (!userAgent || userAgent.length < 10) {
    riskScore += 20
    flags.push('suspicious_user_agent')
  }
  
  // Check for bot patterns
  const botPatterns = [
    /bot/i, /crawler/i, /spider/i, /scraper/i, /curl/i, /wget/i
  ]
  
  if (botPatterns.some(pattern => pattern.test(userAgent))) {
    riskScore += 30
    flags.push('bot_user_agent')
  }
  
  // Check IP reputation (simplified)
  if (clientIP && (clientIP.startsWith('10.') || clientIP.startsWith('192.168.') || clientIP === '127.0.0.1')) {
    // Local/private IP - might be suspicious for production
    flags.push('private_ip')
  }
  
  return new Response(
    JSON.stringify({
      riskScore: Math.min(riskScore, 100),
      riskLevel: getRiskLevel(riskScore),
      flags,
      suspicious: riskScore >= SECURITY_CONFIG.monitoring.mediumRiskThreshold,
      blocked: riskScore >= SECURITY_CONFIG.monitoring.highRiskThreshold
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function handleUpdateSecurityMetrics(req: Request, supabaseClient: any) {
  const now = new Date()
  const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000)
  
  try {
    // Get security metrics for the last 24 hours
    const { data: events, error: eventsError } = await supabaseClient
      .from('security_events')
      .select('eventType, riskScore, success, createdAt')
      .gte('createdAt', twentyFourHoursAgo.toISOString())
    
    if (eventsError) throw eventsError
    
    // Calculate metrics
    const totalEvents = events?.length || 0
    const failedEvents = events?.filter(e => !e.success).length || 0
    const highRiskEvents = events?.filter(e => e.riskScore >= SECURITY_CONFIG.monitoring.highRiskThreshold).length || 0
    const averageRiskScore = totalEvents > 0 
      ? Math.round(events.reduce((sum, e) => sum + e.riskScore, 0) / totalEvents)
      : 0
    
    // Get active sessions count
    const { count: activeSessions, error: sessionsError } = await supabaseClient
      .from('user_sessions')
      .select('*', { count: 'exact', head: true })
      .eq('isActive', true)
    
    if (sessionsError) throw sessionsError
    
    // Get failed login count
    const failedLogins = events?.filter(e => 
      e.eventType === 'login_failed' || e.eventType === 'failed_login'
    ).length || 0
    
    const metrics = {
      timestamp: now.toISOString(),
      totalEvents,
      failedEvents,
      failedLogins,
      highRiskEvents,
      averageRiskScore,
      activeSessions: activeSessions || 0,
      securityScore: Math.max(0, 100 - (failedEvents * 2) - (highRiskEvents * 5)),
      alertLevel: highRiskEvents > 5 ? 'high' : failedEvents > 10 ? 'medium' : 'low'
    }
    
    return new Response(
      JSON.stringify({ success: true, metrics }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
    
  } catch (error) {
    console.error('Failed to update security metrics:', error)
    return new Response(
      JSON.stringify({ error: 'Failed to calculate metrics' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
}

async function triggerSecurityAlert(event: SecurityEvent, supabaseClient: any) {
  try {
    // Create security alert based on the event
    const alertData = {
      type: event.riskScore >= 90 ? 'critical' : 'high',
      title: `High Risk Security Event: ${event.eventType}`,
      description: `Suspicious activity detected from ${event.ipAddress || 'unknown IP'}`,
      eventId: event.userId,
      userId: event.userId,
      riskScore: event.riskScore,
      details: {
        eventType: event.eventType,
        eventCategory: event.eventCategory,
        userAgent: event.userAgent,
        ...event.details
      },
      resolved: false,
      createdAt: new Date().toISOString()
    }
    
    // In production, this would:
    // 1. Send notifications to security team
    // 2. Create tickets in incident management system
    // 3. Potentially auto-block suspicious IPs
    // 4. Log to centralized security monitoring
    
    console.log('SECURITY ALERT:', alertData)
    
    // For now, just log the alert
    // await supabaseClient.from('security_alerts').insert([alertData])
    
  } catch (error) {
    console.error('Failed to trigger security alert:', error)
  }
}

function getRiskLevel(score: number): string {
  if (score >= 80) return 'critical'
  if (score >= 60) return 'high'
  if (score >= 30) return 'medium'
  return 'low'
}