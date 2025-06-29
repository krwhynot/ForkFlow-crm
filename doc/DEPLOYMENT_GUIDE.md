# ForkFlow CRM Backend API Deployment Guide

## Overview

This guide provides step-by-step instructions for deploying the ForkFlow CRM backend API system to production. The system consists of 9 Supabase Edge Functions that provide comprehensive CRM functionality for food brokers.

## Prerequisites

### Required Software
- [Docker Desktop](https://docs.docker.com/desktop/) (for local development)
- [Node.js](https://nodejs.org/) (v18 or later)
- [Supabase CLI](https://supabase.com/docs/guides/cli) (latest version)
- Git (for version control)

### Required Accounts
- [Supabase Account](https://supabase.com/) (for hosting)
- [Google Cloud Account](https://cloud.google.com/) (for Maps API - optional)

## Environment Setup

### 1. Install Dependencies

```bash
# Install project dependencies
npm install

# Install Supabase CLI globally
npm install -g supabase

# Verify installation
supabase --version
```

### 2. Environment Configuration

Create environment files for different stages:

#### Local Development (`.env.local`)
```env
# Supabase Configuration
SUPABASE_URL=http://127.0.0.1:54321
SUPABASE_ANON_KEY=your-local-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-local-service-role-key

# Google Maps API (optional)
GOOGLE_MAPS_API_KEY=your-google-maps-api-key

# Webhook Security
WEBHOOK_SECRET=your-webhook-secret-key
```

#### Production (Environment Variables)
```env
# Supabase Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-production-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-production-service-role-key

# Google Maps API
GOOGLE_MAPS_API_KEY=your-google-maps-api-key

# External Integrations
POSTMARK_SERVER_TOKEN=your-postmark-token
WEBHOOK_SECRET=your-webhook-secret-key
```

## Local Development Setup

### 1. Start Local Supabase

```bash
# Start all Supabase services
make start-supabase

# Or individually
npx supabase start
```

This will start:
- PostgreSQL database (port 54322)
- API server (port 54321) 
- Studio dashboard (port 54323)
- Email testing (port 54324)

### 2. Apply Database Migrations

```bash
# Apply all migrations
make supabase-migrate-database

# Or directly
npx supabase migration up
```

### 3. Start Edge Functions

```bash
# Start functions development server
make start-supabase-functions

# Or directly
npx supabase functions serve --env-file supabase/functions/.env.development
```

### 4. Start Frontend Application

```bash
# Start React development server
make start-app

# Or directly
npm run dev
```

### 5. Verify Local Setup

Visit these URLs to verify everything is working:

- **Application**: http://localhost:5173/
- **Supabase Studio**: http://localhost:54323/
- **API Health**: http://127.0.0.1:54321/rest/v1/
- **Email Inbox**: http://localhost:54324/

## Production Deployment

### 1. Create Supabase Project

```bash
# Login to Supabase
npx supabase login

# Create new project (via dashboard or CLI)
npx supabase projects create your-project-name

# Link local project to remote
npx supabase link --project-ref your-project-ref
```

### 2. Configure Environment Variables

In your Supabase dashboard, set environment variables:

1. Go to Project Settings > API
2. Copy your project URL and API keys
3. Set environment variables in your deployment platform

### 3. Deploy Database Schema

```bash
# Push migrations to production
npx supabase db push

# Verify migration status
npx supabase migration list --linked
```

### 4. Deploy Edge Functions

```bash
# Deploy all functions
make supabase-deploy

# Or deploy individually
npx supabase functions deploy organizations
npx supabase functions deploy organization-analytics
npx supabase functions deploy organization-relationships
npx supabase functions deploy google-maps
npx supabase functions deploy reports
npx supabase functions deploy realtime-analytics
npx supabase functions deploy advanced-export
npx supabase functions deploy webhook-integration
npx supabase functions deploy interactions
```

### 5. Configure Function Environment Variables

For each function that requires environment variables:

```bash
# Set Google Maps API key
npx supabase secrets set GOOGLE_MAPS_API_KEY=your-api-key

# Set webhook secret
npx supabase secrets set WEBHOOK_SECRET=your-webhook-secret

# Set Postmark token (if using email features)
npx supabase secrets set POSTMARK_SERVER_TOKEN=your-postmark-token
```

### 6. Verify Production Deployment

Test each API endpoint:

```bash
# Test organization search
curl -H "Authorization: Bearer your-jwt-token" \
  "https://your-project.supabase.co/functions/v1/organizations/search?q=restaurant"

# Test real-time analytics
curl -H "Authorization: Bearer your-jwt-token" \
  "https://your-project.supabase.co/functions/v1/realtime-analytics/live-dashboard"

# Test webhook creation
curl -X POST \
  -H "Authorization: Bearer your-jwt-token" \
  -H "Content-Type: application/json" \
  -d '{"name":"Test Webhook","url":"https://webhook.site/unique-id","events":["organization.created"]}' \
  "https://your-project.supabase.co/functions/v1/webhook-integration/webhooks"
```

## Frontend Deployment

### 1. Build Production Frontend

```bash
# Build for production
make build

# Or directly
npm run build
```

### 2. Deploy to Hosting Platform

#### Option A: GitHub Pages
```bash
# Deploy to GitHub Pages
make prod-deploy

# Or directly
npm run ghpages:deploy
```

#### Option B: Vercel
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel --prod
```

#### Option C: Netlify
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Deploy
netlify deploy --prod --dir=dist
```

## API Function Overview

### Deployed Functions

| Function | Endpoint | Description |
|----------|----------|-------------|
| `organizations` | `/organizations/*` | Organization management, search, analytics |
| `organization-analytics` | `/organization-analytics/*` | Advanced organization metrics |
| `organization-relationships` | `/organization-relationships/*` | Hierarchy and network analysis |
| `google-maps` | `/google-maps/*` | Geocoding, routing, places search |
| `reports` | `/reports/*` | Executive dashboards and KPIs |
| `realtime-analytics` | `/realtime-analytics/*` | WebSocket real-time updates |
| `advanced-export` | `/advanced-export/*` | Multi-format data exports |
| `webhook-integration` | `/webhook-integration/*` | Third-party integrations |
| `interactions` | `/interactions/*` | Interaction tracking and management |

### Function Resources

Each function is configured with:
- **Memory**: 512MB
- **Timeout**: 300 seconds
- **Concurrency**: 100 requests
- **Runtime**: Deno (latest)

## Database Configuration

### Required Tables

Ensure these tables exist in your database:

```sql
-- Core entity tables
organizations
contacts  
interactions
deals
tasks
notes
settings

-- Analytics and reporting tables
activity_log
export_jobs
export_templates
scheduled_exports
webhooks
webhook_deliveries
webhook_events
incoming_webhooks

-- Relationship mapping tables
organization_relationships
organization_competitors
```

### Row Level Security (RLS)

Enable RLS on all tables with policies:

```sql
-- Example RLS policy for organizations
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their organizations" ON organizations
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can create organizations" ON organizations
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
```

### Indexes for Performance

Create indexes for frequently queried fields:

```sql
-- Geographic search indexes
CREATE INDEX idx_organizations_location ON organizations USING GIST (ll_to_earth(latitude, longitude));

-- Full-text search indexes  
CREATE INDEX idx_organizations_search ON organizations USING GIN (to_tsvector('english', name || ' ' || COALESCE(address, '') || ' ' || COALESCE(notes, '')));

-- Relationship indexes
CREATE INDEX idx_organization_relationships_parent ON organization_relationships (parentId);
CREATE INDEX idx_organization_relationships_child ON organization_relationships (childId);

-- Activity indexes
CREATE INDEX idx_activity_log_created ON activity_log (createdAt DESC);
CREATE INDEX idx_activity_log_entity ON activity_log (entityType, entityId);
```

## Monitoring and Maintenance

### Health Checks

Set up monitoring for:

```bash
# Function health
curl "https://your-project.supabase.co/functions/v1/organizations/health"

# Database connectivity
npx supabase db ping

# Real-time services
curl "https://your-project.supabase.co/functions/v1/realtime-analytics/health"
```

### Log Monitoring

Monitor function logs:

```bash
# View function logs
npx supabase functions logs organizations --follow

# View all function logs
npx supabase functions logs --follow
```

### Performance Monitoring

Track key metrics:
- API response times
- Database query performance
- WebSocket connection counts
- Export job completion rates
- Webhook delivery success rates

### Backup Strategy

```bash
# Backup database
npx supabase db dump > backup-$(date +%Y%m%d).sql

# Backup function code (already in Git)
git archive --format=zip --output=functions-backup-$(date +%Y%m%d).zip HEAD:supabase/functions/
```

## Troubleshooting

### Common Deployment Issues

#### 1. Function Deployment Fails
```bash
# Check function syntax
npx supabase functions verify organizations

# Check environment variables
npx supabase secrets list

# View deployment logs
npx supabase functions logs organizations
```

#### 2. Database Migration Errors
```bash
# Check migration status
npx supabase migration list

# Reset and reapply (CAUTION: destroys data)
npx supabase db reset

# Apply specific migration
npx supabase migration up --target 20240629000000
```

#### 3. Authentication Issues
```bash
# Verify JWT configuration
npx supabase auth verify

# Check RLS policies
SELECT * FROM pg_policies WHERE tablename = 'organizations';

# Test authentication
curl -H "Authorization: Bearer $(supabase auth token)" \
  "https://your-project.supabase.co/rest/v1/organizations?limit=1"
```

#### 4. Real-time Connection Issues
- Check WebSocket URL format
- Verify authentication headers
- Ensure proper CORS configuration
- Monitor connection limits

#### 5. Export Function Timeouts
- Increase function timeout limits
- Implement pagination for large datasets
- Use background job processing
- Monitor memory usage

### Performance Optimization

#### Database Optimization
```sql
-- Analyze query performance
EXPLAIN ANALYZE SELECT * FROM organizations WHERE name ILIKE '%restaurant%';

-- Update table statistics
ANALYZE organizations;

-- Vacuum tables periodically
VACUUM ANALYZE organizations;
```

#### Function Optimization
- Use proper TypeScript types
- Implement connection pooling
- Cache frequently accessed data
- Optimize JSON serialization

## Security Checklist

### Pre-deployment Security Review

- [ ] All environment variables are properly secured
- [ ] RLS policies are enabled and tested
- [ ] API rate limiting is configured
- [ ] Webhook signatures are verified
- [ ] Input validation is implemented
- [ ] Error messages don't leak sensitive information
- [ ] HTTPS is enforced for all communications
- [ ] CORS is properly configured
- [ ] User permissions are validated

### Post-deployment Security Monitoring

- [ ] Monitor API usage patterns
- [ ] Track failed authentication attempts
- [ ] Monitor webhook delivery failures
- [ ] Review database access logs
- [ ] Monitor function execution errors
- [ ] Track export data access

## Scaling Considerations

### Horizontal Scaling
- Supabase Edge Functions automatically scale
- Consider database connection limits
- Monitor function concurrency limits
- Implement proper caching strategies

### Vertical Scaling
- Increase function memory limits if needed
- Optimize database instance size
- Consider read replicas for analytics queries
- Implement CDN for static assets

## Support and Maintenance

### Regular Maintenance Tasks

**Weekly**:
- Review function logs for errors
- Monitor API usage patterns
- Check database performance metrics
- Verify backup integrity

**Monthly**:
- Update dependencies
- Review and optimize database queries
- Analyze function performance metrics
- Test disaster recovery procedures

**Quarterly**:
- Security audit and penetration testing
- Performance benchmarking
- Capacity planning review
- Documentation updates

### Support Resources

- **Supabase Documentation**: https://supabase.com/docs
- **ForkFlow CRM Repository**: [Link to repository]
- **Technical Support**: support@forkflow-crm.com
- **Community Forum**: [Link to forum]

---

This deployment guide ensures a robust, scalable, and secure deployment of the ForkFlow CRM backend API system. Follow the steps carefully and maintain regular monitoring to ensure optimal performance.