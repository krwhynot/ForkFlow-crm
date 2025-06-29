# ForkFlow CRM Integration Examples

## Overview

This guide provides practical examples for integrating with the ForkFlow CRM backend API. It includes code samples for common use cases, best practices, and integration patterns for different platforms and technologies.

## Table of Contents

1. [Authentication Setup](#authentication-setup)
2. [React/TypeScript Integration](#reacttypescript-integration)
3. [Vue.js Integration](#vuejs-integration)
4. [Mobile App Integration](#mobile-app-integration)
5. [Webhook Integrations](#webhook-integrations)
6. [Real-time Dashboard](#real-time-dashboard)
7. [Data Export Integration](#data-export-integration)
8. [Third-party Platform Integrations](#third-party-platform-integrations)

## Authentication Setup

### Basic Supabase Client Setup

```typescript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://your-project.supabase.co';
const supabaseKey = 'your-anon-key';

export const supabase = createClient(supabaseUrl, supabaseKey);

// Helper function to get authenticated headers
export async function getAuthHeaders() {
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session?.access_token) {
    throw new Error('User not authenticated');
  }
  
  return {
    'Authorization': `Bearer ${session.access_token}`,
    'Content-Type': 'application/json'
  };
}
```

### API Client Class

```typescript
class ForkFlowAPI {
  private baseUrl: string;
  
  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }
  
  private async request<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<T> {
    const headers = await getAuthHeaders();
    
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers: {
        ...headers,
        ...options.headers
      }
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'API request failed');
    }
    
    return response.json();
  }
  
  // Organization methods
  async searchOrganizations(params: SearchParams) {
    const searchParams = new URLSearchParams(params);
    return this.request(`/organizations/search?${searchParams}`);
  }
  
  async getOrganizationAnalytics(id: number) {
    return this.request(`/organization-analytics/${id}`);
  }
  
  // Real-time methods
  createWebSocketConnection() {
    return new Promise((resolve, reject) => {
      const ws = new WebSocket(
        `wss://your-project.supabase.co/functions/v1/realtime-analytics/websocket`
      );
      
      ws.onopen = () => resolve(ws);
      ws.onerror = reject;
    });
  }
  
  // Export methods
  async exportData(entity: string, format: string, filters?: any) {
    const params = new URLSearchParams({ format, ...filters });
    const response = await fetch(
      `${this.baseUrl}/advanced-export/export/${entity}?${params}`,
      { headers: await getAuthHeaders() }
    );
    
    return response.blob();
  }
}

export const api = new ForkFlowAPI('https://your-project.supabase.co/functions/v1');
```

## React/TypeScript Integration

### Organization Search Component

```tsx
import React, { useState, useEffect } from 'react';
import { api } from '../services/api';

interface Organization {
  id: number;
  name: string;
  address: string;
  city: string;
  state: string;
  distance?: number;
  matchScore?: number;
}

export const OrganizationSearch: React.FC = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(false);
  const [location, setLocation] = useState<[number, number] | null>(null);

  // Get user location
  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation([position.coords.latitude, position.coords.longitude]);
      },
      (error) => console.warn('Location access denied:', error)
    );
  }, []);

  const handleSearch = async () => {
    if (!query.trim()) return;
    
    setLoading(true);
    try {
      const params: any = { q: query, limit: '20' };
      
      if (location) {
        params.lat = location[0].toString();
        params.lng = location[1].toString();
        params.radius = '50000'; // 50km
      }
      
      const response = await api.searchOrganizations(params);
      setResults(response.data);
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="organization-search">
      <div className="search-input">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search restaurants, stores..."
          onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
        />
        <button onClick={handleSearch} disabled={loading}>
          {loading ? 'Searching...' : 'Search'}
        </button>
      </div>
      
      <div className="results">
        {results.map((org) => (
          <div key={org.id} className="result-item">
            <h3>{org.name}</h3>
            <p>{org.address}, {org.city}, {org.state}</p>
            {org.distance && (
              <span className="distance">
                {(org.distance / 1000).toFixed(1)} km away
              </span>
            )}
            {org.matchScore && (
              <span className="match-score">
                {Math.round(org.matchScore * 100)}% match
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
```

### Real-time Dashboard Hook

```tsx
import { useState, useEffect, useRef } from 'react';

interface DashboardData {
  metrics: {
    totalOrganizations: number;
    totalContacts: number;
    totalInteractions: number;
  };
  alerts: Array<{
    type: string;
    message: string;
  }>;
}

export const useRealTimeDashboard = () => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [connected, setConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    const connectWebSocket = async () => {
      try {
        const ws = await api.createWebSocketConnection();
        wsRef.current = ws;
        
        ws.onopen = () => {
          setConnected(true);
          // Subscribe to dashboard updates
          ws.send(JSON.stringify({
            type: 'subscribe',
            channels: ['dashboard', 'metrics', 'alerts']
          }));
        };
        
        ws.onmessage = (event) => {
          const message = JSON.parse(event.data);
          
          switch (message.type) {
            case 'connection_established':
              console.log('WebSocket connected:', message.connectionId);
              break;
              
            case 'periodic_update':
            case 'data_response':
              setData(message.data);
              break;
              
            case 'broadcast':
              if (message.data.type === 'alert') {
                // Handle real-time alerts
                setData(prev => prev ? {
                  ...prev,
                  alerts: [...prev.alerts, message.data]
                } : null);
              }
              break;
          }
        };
        
        ws.onclose = () => {
          setConnected(false);
          // Attempt reconnection after 5 seconds
          setTimeout(connectWebSocket, 5000);
        };
        
        ws.onerror = (error) => {
          console.error('WebSocket error:', error);
          setConnected(false);
        };
        
      } catch (error) {
        console.error('Failed to connect WebSocket:', error);
        setTimeout(connectWebSocket, 5000);
      }
    };

    connectWebSocket();

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);

  const sendMessage = (message: any) => {
    if (wsRef.current && connected) {
      wsRef.current.send(JSON.stringify(message));
    }
  };

  return { data, connected, sendMessage };
};
```

### Analytics Chart Component

```tsx
import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { api } from '../services/api';

interface ChartData {
  date: string;
  interactions: number;
  deals: number;
}

export const AnalyticsChart: React.FC = () => {
  const [data, setData] = useState<ChartData[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30d');

  useEffect(() => {
    loadChartData();
  }, [timeRange]);

  const loadChartData = async () => {
    setLoading(true);
    try {
      const response = await api.request('/reports/interaction-analytics', {
        method: 'GET'
      });
      
      // Transform data for chart
      const chartData = response.data.timeline.map((item: any) => ({
        date: new Date(item.date).toLocaleDateString(),
        interactions: item.count,
        deals: item.completed
      }));
      
      setData(chartData);
    } catch (error) {
      console.error('Failed to load chart data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div>Loading chart...</div>;
  }

  return (
    <div className="analytics-chart">
      <div className="chart-header">
        <h3>Interaction Trends</h3>
        <select 
          value={timeRange} 
          onChange={(e) => setTimeRange(e.target.value)}
        >
          <option value="7d">Last 7 days</option>
          <option value="30d">Last 30 days</option>
          <option value="90d">Last 90 days</option>
        </select>
      </div>
      
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Line 
            type="monotone" 
            dataKey="interactions" 
            stroke="#8884d8" 
            strokeWidth={2}
          />
          <Line 
            type="monotone" 
            dataKey="deals" 
            stroke="#82ca9d" 
            strokeWidth={2}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};
```

## Vue.js Integration

### Vue 3 Composition API Example

```vue
<template>
  <div class="organization-dashboard">
    <div class="search-section">
      <input 
        v-model="searchQuery"
        @keyup.enter="searchOrganizations"
        placeholder="Search organizations..."
      />
      <button @click="searchOrganizations" :disabled="loading">
        Search
      </button>
    </div>
    
    <div v-if="loading" class="loading">Searching...</div>
    
    <div class="results">
      <div 
        v-for="org in organizations" 
        :key="org.id"
        class="organization-card"
        @click="selectOrganization(org)"
      >
        <h3>{{ org.name }}</h3>
        <p>{{ org.address }}, {{ org.city }}</p>
        <div v-if="org.distance" class="distance">
          {{ (org.distance / 1000).toFixed(1) }} km
        </div>
      </div>
    </div>
    
    <div v-if="selectedOrg" class="organization-details">
      <h2>{{ selectedOrg.name }}</h2>
      <div v-if="analytics" class="analytics">
        <div class="metric">
          <label>Engagement Score:</label>
          <span>{{ analytics.engagementScore }}/100</span>
        </div>
        <div class="metric">
          <label>Risk Level:</label>
          <span>{{ analytics.riskAssessment }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { api } from '../services/api';

const searchQuery = ref('');
const loading = ref(false);
const organizations = ref([]);
const selectedOrg = ref(null);
const analytics = ref(null);

const searchOrganizations = async () => {
  if (!searchQuery.value.trim()) return;
  
  loading.value = true;
  try {
    const response = await api.searchOrganizations({
      q: searchQuery.value,
      limit: '10'
    });
    organizations.value = response.data;
  } catch (error) {
    console.error('Search failed:', error);
  } finally {
    loading.value = false;
  }
};

const selectOrganization = async (org) => {
  selectedOrg.value = org;
  
  try {
    const analyticsResponse = await api.getOrganizationAnalytics(org.id);
    analytics.value = analyticsResponse.data;
  } catch (error) {
    console.error('Failed to load analytics:', error);
  }
};

onMounted(() => {
  // Load initial data
  searchOrganizations();
});
</script>
```

## Mobile App Integration

### React Native Example

```typescript
import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';

interface Organization {
  id: number;
  name: string;
  address: string;
  distance?: number;
}

const OrganizationScreen: React.FC = () => {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);

  useEffect(() => {
    requestLocationPermission();
  }, []);

  const requestLocationPermission = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        const currentLocation = await Location.getCurrentPositionAsync({});
        setLocation({
          latitude: currentLocation.coords.latitude,
          longitude: currentLocation.coords.longitude
        });
      }
    } catch (error) {
      console.warn('Location permission denied');
    }
  };

  const searchOrganizations = async () => {
    if (!searchQuery.trim()) return;

    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('supabase_token');
      if (!token) {
        Alert.alert('Error', 'Please log in first');
        return;
      }

      const params = new URLSearchParams({
        q: searchQuery,
        limit: '20'
      });

      if (location) {
        params.append('lat', location.latitude.toString());
        params.append('lng', location.longitude.toString());
        params.append('radius', '25000'); // 25km for mobile
      }

      const response = await fetch(
        `https://your-project.supabase.co/functions/v1/organizations/search?${params}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const data = await response.json();
      setOrganizations(data.data);
    } catch (error) {
      Alert.alert('Error', 'Search failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderOrganization = ({ item }: { item: Organization }) => (
    <TouchableOpacity 
      style={styles.organizationCard}
      onPress={() => navigateToDetails(item)}
    >
      <Text style={styles.organizationName}>{item.name}</Text>
      <Text style={styles.organizationAddress}>{item.address}</Text>
      {item.distance && (
        <Text style={styles.distance}>
          {(item.distance / 1000).toFixed(1)} km away
        </Text>
      )}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search restaurants, stores..."
          onSubmitEditing={searchOrganizations}
        />
        <TouchableOpacity 
          style={styles.searchButton}
          onPress={searchOrganizations}
          disabled={loading}
        >
          <Text style={styles.searchButtonText}>
            {loading ? 'Searching...' : 'Search'}
          </Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={organizations}
        renderItem={renderOrganization}
        keyExtractor={(item) => item.id.toString()}
        style={styles.list}
      />
    </View>
  );
};
```

## Webhook Integrations

### Setting Up Webhooks

```typescript
// Create webhook for Zapier integration
const createZapierWebhook = async () => {
  const webhook = {
    name: 'Zapier Integration',
    url: 'https://hooks.zapier.com/hooks/catch/12345/abcdef/',
    events: [
      'organization.created',
      'contact.created', 
      'deal.won',
      'interaction.completed'
    ],
    headers: {
      'X-API-Key': 'your-zapier-api-key'
    },
    transformations: {
      fieldMappings: {
        'organizationId': 'company_id',
        'firstName': 'first_name',
        'lastName': 'last_name'
      }
    }
  };

  try {
    const response = await api.request('/webhook-integration/webhooks', {
      method: 'POST',
      body: JSON.stringify(webhook)
    });
    
    console.log('Webhook created:', response.data);
  } catch (error) {
    console.error('Failed to create webhook:', error);
  }
};

// Trigger webhook manually
const triggerDealWonWebhook = async (dealData: any) => {
  try {
    await api.request('/webhook-integration/trigger', {
      method: 'POST',
      body: JSON.stringify({
        event: 'deal.won',
        data: {
          dealId: dealData.id,
          amount: dealData.amount,
          organizationName: dealData.organization.name,
          salesRep: dealData.salesRep,
          closedDate: new Date().toISOString()
        },
        entityId: dealData.id,
        entityType: 'deal'
      })
    });
  } catch (error) {
    console.error('Failed to trigger webhook:', error);
  }
};
```

### Receiving Webhooks (Express.js Server)

```typescript
import express from 'express';
import crypto from 'crypto';

const app = express();
app.use(express.json());

// Webhook signature verification
const verifyWebhookSignature = (payload: string, signature: string, secret: string) => {
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');
  
  return `sha256=${expectedSignature}` === signature;
};

// Receive ForkFlow webhooks
app.post('/webhooks/forkflow', (req, res) => {
  const signature = req.headers['x-webhook-signature'] as string;
  const payload = JSON.stringify(req.body);
  
  if (!verifyWebhookSignature(payload, signature, process.env.WEBHOOK_SECRET!)) {
    return res.status(401).json({ error: 'Invalid signature' });
  }
  
  const { event, data, timestamp } = req.body;
  
  switch (event) {
    case 'organization.created':
      handleNewOrganization(data);
      break;
      
    case 'deal.won':
      handleDealWon(data);
      break;
      
    case 'contact.created':
      handleNewContact(data);
      break;
      
    default:
      console.log('Unhandled webhook event:', event);
  }
  
  res.json({ received: true });
});

const handleNewOrganization = async (data: any) => {
  // Sync to CRM system
  await syncToCRM('organization', data);
  
  // Send notification
  await sendSlackNotification(`New organization added: ${data.name}`);
};

const handleDealWon = async (data: any) => {
  // Update sales dashboard
  await updateSalesDashboard(data);
  
  // Trigger celebration workflow
  await triggerCelebrationWorkflow(data);
};
```

## Data Export Integration

### Automated Export System

```typescript
class ExportManager {
  private api: ForkFlowAPI;
  
  constructor(api: ForkFlowAPI) {
    this.api = api;
  }
  
  // Schedule daily contact export
  async scheduleContactExport() {
    const exportConfig = {
      name: 'Daily Contact Export',
      entity: 'contacts',
      schedule: '0 9 * * *', // 9 AM daily
      format: 'csv',
      recipients: ['sales@company.com', 'manager@company.com'],
      filters: {
        active: true,
        lastContactedSince: '30d'
      }
    };
    
    return this.api.request('/advanced-export/schedule', {
      method: 'POST',
      body: JSON.stringify(exportConfig)
    });
  }
  
  // Generate custom analytics report
  async generateAnalyticsReport(reportType: string, format: string = 'pdf') {
    try {
      const blob = await this.api.exportData('analytics', format, {
        reportType,
        dateRange: '30d'
      });
      
      // Save to file system or cloud storage
      return this.saveReport(blob, `analytics-${reportType}-${format}`);
    } catch (error) {
      console.error('Export failed:', error);
      throw error;
    }
  }
  
  // Monitor export job status
  async monitorExportJob(jobId: string): Promise<any> {
    return new Promise((resolve, reject) => {
      const checkStatus = async () => {
        try {
          const response = await this.api.request(`/advanced-export/jobs/${jobId}`);
          
          if (response.data.status === 'completed') {
            resolve(response.data);
          } else if (response.data.status === 'failed') {
            reject(new Error(response.data.error));
          } else {
            // Check again in 5 seconds
            setTimeout(checkStatus, 5000);
          }
        } catch (error) {
          reject(error);
        }
      };
      
      checkStatus();
    });
  }
  
  private async saveReport(blob: Blob, filename: string) {
    // Implementation depends on your storage solution
    // Could be local file system, AWS S3, Google Cloud Storage, etc.
    
    if (typeof window !== 'undefined') {
      // Browser environment - trigger download
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${filename}-${new Date().toISOString().split('T')[0]}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } else {
      // Node.js environment - save to file system
      const fs = require('fs');
      const buffer = Buffer.from(await blob.arrayBuffer());
      fs.writeFileSync(`./exports/${filename}`, buffer);
    }
  }
}

// Usage example
const exportManager = new ExportManager(api);

// Schedule automated exports
await exportManager.scheduleContactExport();

// Generate on-demand reports
await exportManager.generateAnalyticsReport('dashboard', 'pdf');
await exportManager.generateAnalyticsReport('pipeline', 'excel');
```

## Third-party Platform Integrations

### HubSpot Integration

```typescript
class HubSpotIntegration {
  private hubspotApiKey: string;
  private forkflowApi: ForkFlowAPI;
  
  constructor(hubspotApiKey: string, forkflowApi: ForkFlowAPI) {
    this.hubspotApiKey = hubspotApiKey;
    this.forkflowApi = forkflowApi;
  }
  
  // Sync organizations from ForkFlow to HubSpot
  async syncOrganizationsToHubSpot() {
    try {
      // Get organizations from ForkFlow
      const response = await this.forkflowApi.request('/organizations/search', {
        method: 'GET'
      });
      
      const organizations = response.data;
      
      for (const org of organizations) {
        await this.createHubSpotCompany(org);
      }
    } catch (error) {
      console.error('HubSpot sync failed:', error);
    }
  }
  
  private async createHubSpotCompany(organization: any) {
    const companyData = {
      properties: {
        name: organization.name,
        domain: organization.website,
        city: organization.city,
        state: organization.state,
        phone: organization.phone,
        // Custom properties
        forkflow_id: organization.id.toString(),
        forkflow_engagement_score: organization.engagementScore?.toString()
      }
    };
    
    const response = await fetch('https://api.hubapi.com/crm/v3/objects/companies', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.hubspotApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(companyData)
    });
    
    return response.json();
  }
}
```

### Slack Integration

```typescript
class SlackIntegration {
  private webhookUrl: string;
  
  constructor(webhookUrl: string) {
    this.webhookUrl = webhookUrl;
  }
  
  async sendDealAlert(dealData: any) {
    const message = {
      text: `🎉 Deal Won!`,
      attachments: [
        {
          color: 'good',
          fields: [
            {
              title: 'Organization',
              value: dealData.organizationName,
              short: true
            },
            {
              title: 'Amount',
              value: `$${dealData.amount.toLocaleString()}`,
              short: true
            },
            {
              title: 'Sales Rep',
              value: dealData.salesRep,
              short: true
            }
          ]
        }
      ]
    };
    
    await fetch(this.webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(message)
    });
  }
  
  async sendPipelineAlert(pipelineData: any) {
    if (pipelineData.healthScore < 70) {
      const message = {
        text: `⚠️ Pipeline Health Alert`,
        attachments: [
          {
            color: 'warning',
            text: `Pipeline health score is ${pipelineData.healthScore}/100. ${pipelineData.staleDeals} deals need attention.`
          }
        ]
      };
      
      await fetch(this.webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(message)
      });
    }
  }
}
```

## Best Practices

### Error Handling

```typescript
class ApiErrorHandler {
  static handle(error: any) {
    if (error.response) {
      // API responded with error status
      switch (error.response.status) {
        case 401:
          // Redirect to login
          this.handleAuthError();
          break;
        case 429:
          // Rate limited - implement exponential backoff
          this.handleRateLimit(error);
          break;
        case 500:
          // Server error - retry with backoff
          this.handleServerError(error);
          break;
        default:
          console.error('API Error:', error.response.data);
      }
    } else if (error.request) {
      // Network error
      this.handleNetworkError(error);
    } else {
      // Other error
      console.error('Error:', error.message);
    }
  }
  
  private static async handleAuthError() {
    // Clear stored tokens
    await AsyncStorage.removeItem('supabase_token');
    // Redirect to login
    window.location.href = '/login';
  }
  
  private static async handleRateLimit(error: any) {
    const retryAfter = error.response.headers['retry-after'] || 60;
    console.log(`Rate limited. Retrying after ${retryAfter} seconds`);
    
    return new Promise(resolve => {
      setTimeout(resolve, retryAfter * 1000);
    });
  }
}
```

### Performance Optimization

```typescript
// Implement request caching
class CachedApiClient {
  private cache = new Map();
  private cacheTTL = 5 * 60 * 1000; // 5 minutes
  
  async request(endpoint: string, options: any = {}) {
    const cacheKey = `${endpoint}${JSON.stringify(options)}`;
    const cached = this.cache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < this.cacheTTL) {
      return cached.data;
    }
    
    const response = await api.request(endpoint, options);
    
    this.cache.set(cacheKey, {
      data: response,
      timestamp: Date.now()
    });
    
    return response;
  }
}

// Implement request debouncing for search
import { debounce } from 'lodash';

const debouncedSearch = debounce(async (query: string) => {
  const results = await api.searchOrganizations({ q: query });
  setSearchResults(results.data);
}, 300);
```

This comprehensive integration guide provides practical examples for implementing ForkFlow CRM API functionality across different platforms and use cases. Use these examples as starting points and adapt them to your specific requirements.