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
 * Google Maps Integration API Endpoints
 * Provides geocoding, places search, route optimization, and address validation
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
        if (url.pathname.includes('/geocode')) {
          return await geocodeAddress(req, url, user);
        } else if (url.pathname.includes('/reverse-geocode')) {
          return await reverseGeocode(req, url, user);
        } else if (url.pathname.includes('/places/search')) {
          return await searchPlaces(req, url, user);
        } else if (url.pathname.includes('/places/details')) {
          return await getPlaceDetails(req, url, user);
        } else if (url.pathname.includes('/directions')) {
          return await getDirections(req, url, user);
        } else if (url.pathname.includes('/distance-matrix')) {
          return await getDistanceMatrix(req, url, user);
        } else if (url.pathname.includes('/optimize-route')) {
          return await optimizeRoute(req, url, user);
        }
        break;

      case 'POST':
        if (url.pathname.includes('/batch-geocode')) {
          return await batchGeocode(req, url, user);
        } else if (url.pathname.includes('/validate-addresses')) {
          return await validateAddresses(req, url, user);
        } else if (url.pathname.includes('/enrich-organization')) {
          return await enrichOrganizationData(req, url, user);
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
    console.error('Google Maps API Error:', error);
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
 * GET /google-maps/geocode - Geocode an address to coordinates
 */
async function geocodeAddress(req: Request, url: URL, user: any) {
  const searchParams = url.searchParams;
  const address = searchParams.get('address');
  
  if (!address) {
    return new Response(
      JSON.stringify({ error: 'Address parameter is required' }),
      { 
        status: 400, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }

  const googleMapsApiKey = Deno.env.get('GOOGLE_MAPS_API_KEY');
  if (!googleMapsApiKey) {
    return new Response(
      JSON.stringify({ error: 'Google Maps API key not configured' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }

  try {
    // Call Google Geocoding API
    const geocodeUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${googleMapsApiKey}`;
    const response = await fetch(geocodeUrl);
    const data = await response.json();

    if (data.status !== 'OK') {
      return new Response(
        JSON.stringify({ 
          error: 'Geocoding failed', 
          status: data.status,
          message: data.error_message || 'Unknown error'
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const result = data.results[0];
    const location = result.geometry.location;
    
    // Extract address components
    const addressComponents = extractAddressComponents(result.address_components);

    return new Response(
      JSON.stringify({
        data: {
          latitude: location.lat,
          longitude: location.lng,
          formattedAddress: result.formatted_address,
          addressComponents,
          placeId: result.place_id,
          accuracy: result.geometry.location_type,
          viewport: result.geometry.viewport,
        }
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Geocoding error:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Geocoding service unavailable',
        message: error.message
      }),
      { 
        status: 503, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
}

/**
 * GET /google-maps/reverse-geocode - Get address from coordinates
 */
async function reverseGeocode(req: Request, url: URL, user: any) {
  const searchParams = url.searchParams;
  const lat = searchParams.get('lat');
  const lng = searchParams.get('lng');
  
  if (!lat || !lng) {
    return new Response(
      JSON.stringify({ error: 'lat and lng parameters are required' }),
      { 
        status: 400, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }

  const googleMapsApiKey = Deno.env.get('GOOGLE_MAPS_API_KEY');
  if (!googleMapsApiKey) {
    return new Response(
      JSON.stringify({ error: 'Google Maps API key not configured' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }

  try {
    const reverseGeocodeUrl = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${googleMapsApiKey}`;
    const response = await fetch(reverseGeocodeUrl);
    const data = await response.json();

    if (data.status !== 'OK') {
      return new Response(
        JSON.stringify({ 
          error: 'Reverse geocoding failed', 
          status: data.status 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const results = data.results.map((result: any) => ({
      formattedAddress: result.formatted_address,
      addressComponents: extractAddressComponents(result.address_components),
      placeId: result.place_id,
      types: result.types,
    }));

    return new Response(
      JSON.stringify({ data: results }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Reverse geocoding error:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Reverse geocoding service unavailable',
        message: error.message
      }),
      { 
        status: 503, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
}

/**
 * GET /google-maps/places/search - Search for places near a location
 */
async function searchPlaces(req: Request, url: URL, user: any) {
  const searchParams = url.searchParams;
  const query = searchParams.get('query');
  const location = searchParams.get('location'); // lat,lng format
  const radius = searchParams.get('radius') || '50000'; // 50km default
  const type = searchParams.get('type'); // e.g., 'restaurant', 'store'
  
  if (!query && !location) {
    return new Response(
      JSON.stringify({ error: 'Either query or location parameter is required' }),
      { 
        status: 400, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }

  const googleMapsApiKey = Deno.env.get('GOOGLE_MAPS_API_KEY');
  if (!googleMapsApiKey) {
    return new Response(
      JSON.stringify({ error: 'Google Maps API key not configured' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }

  try {
    let placesUrl = 'https://maps.googleapis.com/maps/api/place/nearbysearch/json?';
    
    if (query) {
      placesUrl = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(query)}&`;
    }
    
    if (location) {
      placesUrl += `location=${location}&radius=${radius}&`;
    }
    
    if (type) {
      placesUrl += `type=${type}&`;
    }
    
    placesUrl += `key=${googleMapsApiKey}`;

    const response = await fetch(placesUrl);
    const data = await response.json();

    if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
      return new Response(
        JSON.stringify({ 
          error: 'Places search failed', 
          status: data.status 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const places = data.results.map((place: any) => ({
      placeId: place.place_id,
      name: place.name,
      address: place.formatted_address || place.vicinity,
      location: place.geometry.location,
      rating: place.rating,
      priceLevel: place.price_level,
      types: place.types,
      openNow: place.opening_hours?.open_now,
      photos: place.photos?.map((photo: any) => ({
        reference: photo.photo_reference,
        width: photo.width,
        height: photo.height,
      })),
    }));

    return new Response(
      JSON.stringify({ 
        data: places,
        nextPageToken: data.next_page_token 
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Places search error:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Places search service unavailable',
        message: error.message
      }),
      { 
        status: 503, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
}

/**
 * GET /google-maps/directions - Get directions between two points
 */
async function getDirections(req: Request, url: URL, user: any) {
  const searchParams = url.searchParams;
  const origin = searchParams.get('origin');
  const destination = searchParams.get('destination');
  const waypoints = searchParams.get('waypoints');
  const mode = searchParams.get('mode') || 'driving';
  const optimize = searchParams.get('optimize') === 'true';
  
  if (!origin || !destination) {
    return new Response(
      JSON.stringify({ error: 'origin and destination parameters are required' }),
      { 
        status: 400, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }

  const googleMapsApiKey = Deno.env.get('GOOGLE_MAPS_API_KEY');
  if (!googleMapsApiKey) {
    return new Response(
      JSON.stringify({ error: 'Google Maps API key not configured' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }

  try {
    let directionsUrl = `https://maps.googleapis.com/maps/api/directions/json?origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(destination)}&mode=${mode}&key=${googleMapsApiKey}`;
    
    if (waypoints) {
      directionsUrl += `&waypoints=${optimize ? 'optimize:true|' : ''}${encodeURIComponent(waypoints)}`;
    }

    const response = await fetch(directionsUrl);
    const data = await response.json();

    if (data.status !== 'OK') {
      return new Response(
        JSON.stringify({ 
          error: 'Directions request failed', 
          status: data.status 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const route = data.routes[0];
    const leg = route.legs[0];

    return new Response(
      JSON.stringify({
        data: {
          distance: leg.distance,
          duration: leg.duration,
          startAddress: leg.start_address,
          endAddress: leg.end_address,
          steps: leg.steps.map((step: any) => ({
            distance: step.distance,
            duration: step.duration,
            instructions: step.html_instructions.replace(/<[^>]*>/g, ''), // Strip HTML
            startLocation: step.start_location,
            endLocation: step.end_location,
            maneuver: step.maneuver,
          })),
          overview: {
            bounds: route.bounds,
            copyrights: route.copyrights,
            waypoint_order: route.waypoint_order,
            overview_polyline: route.overview_polyline,
          }
        }
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Directions error:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Directions service unavailable',
        message: error.message
      }),
      { 
        status: 503, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
}

/**
 * GET /google-maps/optimize-route - Optimize route for multiple destinations
 */
async function optimizeRoute(req: Request, url: URL, user: any) {
  const searchParams = url.searchParams;
  const origin = searchParams.get('origin');
  const destinations = searchParams.get('destinations')?.split('|');
  const returnToOrigin = searchParams.get('returnToOrigin') === 'true';
  
  if (!origin || !destinations || destinations.length === 0) {
    return new Response(
      JSON.stringify({ error: 'origin and destinations parameters are required' }),
      { 
        status: 400, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }

  const googleMapsApiKey = Deno.env.get('GOOGLE_MAPS_API_KEY');
  if (!googleMapsApiKey) {
    return new Response(
      JSON.stringify({ error: 'Google Maps API key not configured' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }

  try {
    // Use Distance Matrix API to get distances between all points
    const allPoints = [origin, ...destinations];
    const distanceMatrix = await getDistanceMatrixData(allPoints, googleMapsApiKey);
    
    // Simple optimization algorithm (nearest neighbor)
    const optimizedOrder = optimizeRouteOrder(distanceMatrix, returnToOrigin);
    
    // Get detailed directions for the optimized route
    const waypoints = optimizedOrder.slice(1, -1).map(index => allPoints[index]).join('|');
    const finalDestination = returnToOrigin ? origin : allPoints[optimizedOrder[optimizedOrder.length - 1]];
    
    let directionsUrl = `https://maps.googleapis.com/maps/api/directions/json?origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(finalDestination)}&key=${googleMapsApiKey}`;
    
    if (waypoints) {
      directionsUrl += `&waypoints=${encodeURIComponent(waypoints)}`;
    }

    const directionsResponse = await fetch(directionsUrl);
    const directionsData = await directionsResponse.json();

    if (directionsData.status !== 'OK') {
      return new Response(
        JSON.stringify({ 
          error: 'Route optimization failed', 
          status: directionsData.status 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const route = directionsData.routes[0];
    
    return new Response(
      JSON.stringify({
        data: {
          optimizedOrder,
          optimizedPoints: optimizedOrder.map(index => allPoints[index]),
          totalDistance: route.legs.reduce((sum: number, leg: any) => sum + leg.distance.value, 0),
          totalDuration: route.legs.reduce((sum: number, leg: any) => sum + leg.duration.value, 0),
          route: {
            legs: route.legs,
            overview_polyline: route.overview_polyline,
            bounds: route.bounds,
          },
          savings: calculateRouteSavings(distanceMatrix, optimizedOrder),
        }
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Route optimization error:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Route optimization service unavailable',
        message: error.message
      }),
      { 
        status: 503, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
}

/**
 * POST /google-maps/batch-geocode - Geocode multiple addresses
 */
async function batchGeocode(req: Request, url: URL, user: any) {
  const body = await req.json();
  const addresses = body.addresses;
  
  if (!addresses || !Array.isArray(addresses)) {
    return new Response(
      JSON.stringify({ error: 'addresses array is required' }),
      { 
        status: 400, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }

  const googleMapsApiKey = Deno.env.get('GOOGLE_MAPS_API_KEY');
  if (!googleMapsApiKey) {
    return new Response(
      JSON.stringify({ error: 'Google Maps API key not configured' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }

  const results = [];
  const errors = [];

  for (let i = 0; i < addresses.length; i++) {
    const address = addresses[i];
    
    try {
      const geocodeUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${googleMapsApiKey}`;
      const response = await fetch(geocodeUrl);
      const data = await response.json();

      if (data.status === 'OK') {
        const result = data.results[0];
        const location = result.geometry.location;
        
        results.push({
          index: i,
          address,
          latitude: location.lat,
          longitude: location.lng,
          formattedAddress: result.formatted_address,
          addressComponents: extractAddressComponents(result.address_components),
          placeId: result.place_id,
        });
      } else {
        errors.push({
          index: i,
          address,
          error: data.status,
          message: data.error_message || 'Geocoding failed',
        });
      }

      // Add delay to respect API rate limits
      if (i < addresses.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }

    } catch (error) {
      errors.push({
        index: i,
        address,
        error: 'NETWORK_ERROR',
        message: error.message,
      });
    }
  }

  return new Response(
    JSON.stringify({
      data: {
        results,
        errors,
        totalProcessed: addresses.length,
        successCount: results.length,
        errorCount: errors.length,
      }
    }),
    { 
      status: 200, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    }
  );
}

/**
 * Helper functions
 */
function extractAddressComponents(components: any[]) {
  const result: any = {};
  
  components.forEach((component: any) => {
    const types = component.types;
    
    if (types.includes('street_number')) {
      result.streetNumber = component.long_name;
    } else if (types.includes('route')) {
      result.street = component.long_name;
    } else if (types.includes('locality')) {
      result.city = component.long_name;
    } else if (types.includes('administrative_area_level_1')) {
      result.state = component.short_name;
      result.stateLong = component.long_name;
    } else if (types.includes('country')) {
      result.country = component.short_name;
      result.countryLong = component.long_name;
    } else if (types.includes('postal_code')) {
      result.postalCode = component.long_name;
    }
  });
  
  return result;
}

async function getDistanceMatrixData(points: string[], apiKey: string) {
  const pointsStr = points.map(p => encodeURIComponent(p)).join('|');
  const url = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${pointsStr}&destinations=${pointsStr}&key=${apiKey}`;
  
  const response = await fetch(url);
  const data = await response.json();
  
  if (data.status !== 'OK') {
    throw new Error(`Distance Matrix API failed: ${data.status}`);
  }
  
  return data;
}

function optimizeRouteOrder(distanceMatrix: any, returnToOrigin: boolean): number[] {
  const points = distanceMatrix.rows.length;
  const visited = new Array(points).fill(false);
  const order = [0]; // Start at origin
  visited[0] = true;
  
  let current = 0;
  
  // Nearest neighbor algorithm
  for (let i = 1; i < points; i++) {
    let nearest = -1;
    let shortestDistance = Infinity;
    
    for (let j = 0; j < points; j++) {
      if (!visited[j]) {
        const distance = distanceMatrix.rows[current].elements[j].distance.value;
        if (distance < shortestDistance) {
          shortestDistance = distance;
          nearest = j;
        }
      }
    }
    
    if (nearest !== -1) {
      order.push(nearest);
      visited[nearest] = true;
      current = nearest;
    }
  }
  
  if (returnToOrigin) {
    order.push(0);
  }
  
  return order;
}

function calculateRouteSavings(distanceMatrix: any, optimizedOrder: number[]): any {
  // Calculate total distance for optimized route
  let optimizedDistance = 0;
  for (let i = 0; i < optimizedOrder.length - 1; i++) {
    const from = optimizedOrder[i];
    const to = optimizedOrder[i + 1];
    optimizedDistance += distanceMatrix.rows[from].elements[to].distance.value;
  }
  
  // Calculate distance for simple sequential route (0,1,2,3...)
  let sequentialDistance = 0;
  for (let i = 0; i < distanceMatrix.rows.length - 1; i++) {
    sequentialDistance += distanceMatrix.rows[i].elements[i + 1].distance.value;
  }
  
  const savingsDistance = sequentialDistance - optimizedDistance;
  const savingsPercentage = (savingsDistance / sequentialDistance) * 100;
  
  return {
    optimizedDistance: optimizedDistance,
    sequentialDistance: sequentialDistance,
    savingsDistance: savingsDistance,
    savingsPercentage: Math.round(savingsPercentage * 100) / 100,
  };
}

// Placeholder implementations for remaining endpoints
async function getPlaceDetails(req: Request, url: URL, user: any) {
  return new Response(
    JSON.stringify({ message: 'Place details endpoint - to be implemented' }),
    { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function getDistanceMatrix(req: Request, url: URL, user: any) {
  return new Response(
    JSON.stringify({ message: 'Distance matrix endpoint - to be implemented' }),
    { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function validateAddresses(req: Request, url: URL, user: any) {
  return new Response(
    JSON.stringify({ message: 'Address validation endpoint - to be implemented' }),
    { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function enrichOrganizationData(req: Request, url: URL, user: any) {
  return new Response(
    JSON.stringify({ message: 'Organization data enrichment endpoint - to be implemented' }),
    { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}