# ForkFlow CRM Backend API Documentation

## Overview

ForkFlow CRM provides a comprehensive set of RESTful APIs and real-time services designed specifically for food brokers and distributors. The backend is built on Supabase Edge Functions using Deno runtime, providing scalable, serverless API endpoints with built-in authentication and real-time capabilities.

## Base URL
```
https://your-project.supabase.co/functions/v1/
```

## Authentication

All API endpoints require JWT authentication using Supabase Auth. Include the JWT token in the Authorization header:

```http
Authorization: Bearer <your-jwt-token>
```

## API Endpoints

### 1. Organization Management API

Base endpoint: `/organizations`

#### Search Organizations
```http
GET /organizations/search?q={query}&lat={latitude}&lng={longitude}&radius={radius}
```

**Description**: Advanced search with full-text search and GPS proximity filtering.

**Parameters**:
- `q` (string, optional): Search query for name, address, notes
- `lat` (number, optional): Latitude for proximity search
- `lng` (number, optional): Longitude for proximity search  
- `radius` (number, optional): Search radius in meters (default: 50000)
- `limit` (number, optional): Maximum results (default: 20)

**Response**:
```json
{
  "data": [
    {
      "id": 1,
      "name": "Restaurant Name",
      "address": "123 Main St",
      "city": "City",
      "state": "ST",
      "distance": 1250,
      "matchScore": 0.95,
      "matchReason": "Name and location match",
      "priority": {
        "id": 1,
        "label": "High",
        "color": "#ff4444"
      }
    }
  ],
  "metadata": {
    "totalResults": 25,
    "searchRadius": 50000,
    "searchCenter": [lat, lng]
  }
}
```

#### Get Nearby Organizations
```http
GET /organizations/nearby?lat={latitude}&lng={longitude}&radius={radius}
```

**Description**: Find organizations within specified radius using GPS coordinates.

#### Bulk Import Organizations
```http
POST /organizations/bulk-import
```

**Request Body**:
```json
{
  "organizations": [
    {
      "name": "Restaurant Name",
      "address": "123 Main St",
      "city": "City",
      "state": "ST",
      "phone": "555-0123"
    }
  ],
  "options": {
    "skipDuplicates": true,
    "updateExisting": false
  }
}
```

#### Organization Analytics
```http
GET /organizations/{id}/analytics
```

**Response**:
```json
{
  "data": {
    "engagementScore": 85,
    "riskAssessment": "Low",
    "opportunities": [
      {
        "type": "upsell",
        "confidence": 0.8,
        "description": "High engagement suggests upsell potential"
      }
    ],
    "metrics": {
      "totalInteractions": 15,
      "lastContactDate": "2024-06-25T10:30:00Z",
      "averageResponseTime": "2.5 hours"
    }
  }
}
```

### 2. Organization Relationships API

Base endpoint: `/organization-relationships`

#### Get Organization Hierarchy
```http
GET /organization-relationships/hierarchy?organizationId={id}
```

**Parameters**:
- `organizationId` (required): Target organization ID
- `includeChildren` (boolean, default: true): Include child organizations
- `includeParents` (boolean, default: true): Include parent organizations
- `maxDepth` (number, default: 3): Maximum hierarchy depth

#### Contact Network Analysis
```http
GET /organization-relationships/contact-network?organizationId={id}
```

**Response**:
```json
{
  "data": [
    {
      "id": 1,
      "firstName": "John",
      "lastName": "Doe",
      "role": {"label": "CEO"},
      "influenceScore": 95,
      "interactionCount": 12,
      "recentInteractionCount": 5,
      "decisionRole": {"label": "Decision Maker"}
    }
  ],
  "analysis": {
    "totalContacts": 8,
    "averageInfluence": 65,
    "topInfluencers": [...],
    "decisionMakers": [...],
    "contactCoverage": {
      "executive": 2,
      "management": 3,
      "operational": 3
    }
  }
}
```

#### Competitive Analysis
```http
GET /organization-relationships/competitors?organizationId={id}
```

### 3. Google Maps Integration API

Base endpoint: `/google-maps`

#### Geocode Address
```http
GET /google-maps/geocode?address={address}
```

#### Reverse Geocode
```http
GET /google-maps/reverse-geocode?lat={lat}&lng={lng}
```

#### Places Search
```http
GET /google-maps/places/search?query={query}&location={lat,lng}&radius={radius}
```

#### Route Optimization
```http
GET /google-maps/optimize-route?origin={address}&destinations={address1|address2|address3}
```

**Response**:
```json
{
  "data": {
    "optimizedOrder": [0, 2, 1, 3],
    "optimizedPoints": ["Origin", "Stop2", "Stop1", "Stop3"],
    "totalDistance": 45000,
    "totalDuration": 3600,
    "savings": {
      "savingsDistance": 8000,
      "savingsPercentage": 15.2
    }
  }
}
```

#### Batch Geocoding
```http
POST /google-maps/batch-geocode
```

**Request Body**:
```json
{
  "addresses": [
    "123 Main St, City, ST",
    "456 Oak Ave, City, ST"
  ]
}
```

### 4. Reporting & Analytics API

Base endpoint: `/reports`

#### Executive Dashboard
```http
GET /reports/executive-dashboard?period={days}
```

**Response**:
```json
{
  "data": {
    "metrics": {
      "totalRevenue": 250000,
      "pipelineValue": 180000,
      "conversionRate": 23.5,
      "activeDeals": 45
    },
    "trends": {
      "revenueGrowth": 12.5,
      "pipelineGrowth": 8.2
    },
    "alerts": [
      {
        "type": "warning",
        "message": "5 deals stale for 30+ days"
      }
    ]
  }
}
```

#### KPI Summary
```http
GET /reports/kpi-summary
```

#### Territory Performance
```http
GET /reports/territory-performance?territory={name}
```

#### Sales Velocity Analysis
```http
GET /reports/sales-velocity?startDate={date}&endDate={date}
```

#### Pipeline Health
```http
GET /reports/pipeline-health
```

**Response**:
```json
{
  "data": {
    "overallHealth": "Good",
    "healthScore": 78,
    "metrics": {
      "averageDealAge": 35,
      "staleDeals": 3,
      "velocityTrend": "Improving"
    },
    "recommendations": [
      "Follow up on 3 stale deals over 60 days old",
      "Accelerate deals in qualification stage"
    ]
  }
}
```

### 5. Real-time Analytics API

Base endpoint: `/realtime-analytics`

#### WebSocket Connection
```http
GET /realtime-analytics/websocket
Upgrade: websocket
```

**WebSocket Message Format**:
```json
{
  "type": "subscribe",
  "channels": ["dashboard", "metrics", "alerts"]
}
```

**Real-time Updates**:
```json
{
  "type": "periodic_update",
  "data": {
    "totalOrganizations": 150,
    "totalContacts": 450,
    "totalInteractions": 1200
  },
  "timestamp": "2024-06-29T12:30:00Z"
}
```

#### Live Dashboard Data
```http
GET /realtime-analytics/live-dashboard
```

#### Streaming Metrics
```http
GET /realtime-analytics/streaming-metrics?metric={type}&interval={period}
```

**Parameters**:
- `metric`: interactions, deals, organizations, performance
- `interval`: 1m, 5m, 1h

#### Activity Feed
```http
GET /realtime-analytics/activity-feed?limit={count}&since={timestamp}
```

#### Broadcast Update
```http
POST /realtime-analytics/broadcast
```

**Request Body**:
```json
{
  "type": "alert",
  "data": {
    "message": "New high-priority lead created",
    "priority": "high"
  },
  "channels": ["dashboard", "alerts"]
}
```

### 6. Advanced Export API

Base endpoint: `/advanced-export`

#### Export Organizations
```http
GET /advanced-export/export/organizations?format={format}&includeRelated={boolean}
```

**Parameters**:
- `format`: csv, json, excel, pdf
- `includeRelated`: Include contacts, interactions, deals
- `templateId`: Custom export template ID
- `filters`: JSON filters object

#### Export Analytics
```http
GET /advanced-export/export/analytics?reportType={type}&format={format}
```

**Parameters**:
- `reportType`: dashboard, interactions, pipeline, performance, comprehensive
- `format`: csv, json, excel, pdf
- `dateRange`: 7d, 30d, 90d

#### Bulk Export
```http
POST /advanced-export/export/bulk
```

**Request Body**:
```json
{
  "entities": ["organizations", "contacts", "interactions"],
  "format": "json",
  "includeRelated": true,
  "filters": {
    "dateRange": "30d"
  }
}
```

**Response**:
```json
{
  "data": {
    "jobId": "uuid-job-id",
    "status": "processing",
    "estimatedCompletionTime": "2 minutes"
  }
}
```

#### Create Export Template
```http
POST /advanced-export/templates
```

**Request Body**:
```json
{
  "name": "Monthly Sales Report",
  "entity": "organizations",
  "columns": ["name", "city", "totalRevenue", "lastContactDate"],
  "transformations": {
    "fieldMappings": {
      "totalRevenue": "revenue"
    }
  },
  "format": "csv"
}
```

#### Schedule Export
```http
POST /advanced-export/schedule
```

**Request Body**:
```json
{
  "name": "Weekly Contact Export",
  "entity": "contacts",
  "schedule": "0 9 * * 1",
  "format": "csv",
  "recipients": ["manager@company.com"],
  "filters": {
    "active": true
  }
}
```

### 7. Webhook Integration API

Base endpoint: `/webhook-integration`

#### Create Webhook
```http
POST /webhook-integration/webhooks
```

**Request Body**:
```json
{
  "name": "Sales CRM Integration",
  "url": "https://your-app.com/webhooks/forkflow",
  "events": [
    "organization.created",
    "deal.won",
    "interaction.completed"
  ],
  "headers": {
    "X-API-Key": "your-api-key"
  },
  "transformations": {
    "fieldMappings": {
      "organizationId": "company_id"
    }
  }
}
```

#### List Webhooks
```http
GET /webhook-integration/webhooks?isActive={boolean}&event={eventType}
```

#### Test Webhook
```http
POST /webhook-integration/test
```

**Request Body**:
```json
{
  "webhookId": "webhook-uuid",
  "testPayload": {
    "event": "test.webhook",
    "data": {
      "message": "Test delivery"
    }
  }
}
```

#### Trigger Webhook
```http
POST /webhook-integration/trigger
```

**Request Body**:
```json
{
  "event": "deal.won",
  "data": {
    "dealId": 123,
    "amount": 50000,
    "organizationName": "Restaurant ABC"
  },
  "entityId": 123,
  "entityType": "deal"
}
```

#### Receive Third-party Webhooks
```http
POST /webhook-integration/receive/{provider}
```

**Supported Providers**:
- zapier
- mailchimp
- hubspot
- salesforce
- slack
- teams

**Example - Zapier Integration**:
```json
{
  "action": "create_contact",
  "data": {
    "first_name": "John",
    "last_name": "Doe",
    "email": "john@restaurant.com",
    "organization_id": 123
  }
}
```

#### List Available Events
```http
GET /webhook-integration/events
```

**Response**:
```json
{
  "data": [
    "organization.created",
    "organization.updated", 
    "organization.deleted",
    "contact.created",
    "contact.updated",
    "contact.deleted",
    "interaction.created",
    "interaction.completed",
    "deal.created",
    "deal.won",
    "deal.lost",
    "task.created",
    "task.completed",
    "task.overdue"
  ]
}
```

## Error Handling

All APIs use consistent error response format:

```json
{
  "error": "Error type",
  "message": "Detailed error description",
  "timestamp": "2024-06-29T12:30:00Z"
}
```

### Common HTTP Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request (invalid parameters)
- `401` - Unauthorized (missing/invalid JWT)
- `404` - Not Found
- `405` - Method Not Allowed
- `500` - Internal Server Error
- `503` - Service Unavailable

## Rate Limiting

- **Standard endpoints**: 100 requests per minute per user
- **Search endpoints**: 50 requests per minute per user  
- **Export endpoints**: 10 requests per minute per user
- **Real-time connections**: 5 concurrent WebSocket connections per user

## Data Types and Schemas

### Organization Schema
```typescript
interface Organization {
  id: number;
  name: string;
  address?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  phone?: string;
  website?: string;
  latitude?: number;
  longitude?: number;
  priorityId?: number;
  segmentId?: number;
  distributorId?: number;
  accountManager?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}
```

### Contact Schema
```typescript
interface Contact {
  id: number;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  organizationId: number;
  roleId?: number;
  influenceLevelId?: number;
  decisionRoleId?: number;
  isPrimary: boolean;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}
```

### Interaction Schema
```typescript
interface Interaction {
  id: number;
  organizationId: number;
  contactId?: number;
  typeId: number;
  scheduledDate: string;
  notes?: string;
  isCompleted: boolean;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
}
```

## SDK and Integration Examples

### JavaScript/TypeScript Client
```typescript
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://your-project.supabase.co',
  'your-anon-key'
);

// Search organizations
async function searchOrganizations(query: string, location?: [number, number]) {
  const { data: { session } } = await supabase.auth.getSession();
  
  const params = new URLSearchParams({
    q: query,
    ...(location && {
      lat: location[0].toString(),
      lng: location[1].toString()
    })
  });
  
  const response = await fetch(
    `https://your-project.supabase.co/functions/v1/organizations/search?${params}`,
    {
      headers: {
        'Authorization': `Bearer ${session?.access_token}`,
        'Content-Type': 'application/json'
      }
    }
  );
  
  return response.json();
}

// WebSocket connection
function connectRealtime() {
  const ws = new WebSocket(
    'wss://your-project.supabase.co/functions/v1/realtime-analytics/websocket',
    [], 
    {
      headers: {
        'Authorization': `Bearer ${session?.access_token}`
      }
    }
  );
  
  ws.onopen = () => {
    ws.send(JSON.stringify({
      type: 'subscribe',
      channels: ['dashboard', 'metrics']
    }));
  };
  
  ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    console.log('Real-time update:', data);
  };
}
```

### Python Client
```python
import requests
import json
from supabase import create_client

supabase = create_client("https://your-project.supabase.co", "your-anon-key")

def search_organizations(query, lat=None, lng=None):
    session = supabase.auth.get_session()
    
    params = {'q': query}
    if lat and lng:
        params.update({'lat': lat, 'lng': lng})
    
    response = requests.get(
        'https://your-project.supabase.co/functions/v1/organizations/search',
        params=params,
        headers={
            'Authorization': f'Bearer {session.access_token}',
            'Content-Type': 'application/json'
        }
    )
    
    return response.json()

def export_data(entity, format='csv'):
    session = supabase.auth.get_session()
    
    response = requests.get(
        f'https://your-project.supabase.co/functions/v1/advanced-export/export/{entity}',
        params={'format': format},
        headers={
            'Authorization': f'Bearer {session.access_token}'
        }
    )
    
    return response.content
```

## Performance Guidelines

### Best Practices

1. **Pagination**: Use appropriate limit parameters for large datasets
2. **Caching**: Cache frequently accessed data on the client side
3. **Batch Operations**: Use bulk endpoints for multiple operations
4. **Filtering**: Apply filters server-side rather than client-side
5. **Real-time**: Only subscribe to necessary channels

### Performance Metrics

- **Average Response Time**: < 200ms for standard queries
- **Search Response Time**: < 500ms for complex searches
- **Export Generation**: < 30 seconds for standard exports
- **WebSocket Latency**: < 100ms for real-time updates

## Security Considerations

1. **Authentication**: All endpoints require valid JWT tokens
2. **Authorization**: Row Level Security (RLS) enforced at database level
3. **Data Validation**: Input validation on all endpoints
4. **Rate Limiting**: Protection against abuse
5. **HTTPS Only**: All communications encrypted
6. **Webhook Security**: HMAC signatures for webhook verification

## Troubleshooting

### Common Issues

1. **401 Unauthorized**: Check JWT token validity and refresh if needed
2. **404 Not Found**: Verify endpoint URLs and resource IDs
3. **500 Server Error**: Check server logs and retry with exponential backoff
4. **WebSocket Connection Failed**: Verify authentication and network connectivity
5. **Export Timeout**: Use bulk export jobs for large datasets

### Support

For technical support and API questions:
- Documentation: [Link to docs]
- GitHub Issues: [Link to repository]
- Support Email: support@forkflow-crm.com

---

*This documentation covers the comprehensive ForkFlow CRM backend API system. For the most up-to-date information, please refer to the official documentation and changelog.*