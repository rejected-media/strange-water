export const prerender = false;

import type { APIRoute } from 'astro';
import {
  RATE_LIMIT_MAX_REQUESTS,
  RATE_LIMIT_WINDOW_MS,
  ContributionService,
  getEnv,
  getRequiredEnv,
  getClientIP,
  logError
} from '@podcast-framework/core';

/**
 * CORS Configuration: Allowed Origins
 *
 * Configure the domains allowed to make requests to this API.
 * Always include your production domain and localhost for development.
 *
 * SECURITY: Never use "*" wildcard in production - it allows any website
 * to make requests to your API, enabling CSRF attacks.
 */
const ALLOWED_ORIGINS = [
  'https://yourpodcast.com',           // TODO: Replace with your production domain
  'https://www.yourpodcast.com',       // TODO: Replace with your www domain
  'http://localhost:4321',             // Development
  'http://localhost:3000',             // Alternative dev port
];

/**
 * Get CORS headers with origin validation
 */
function getCorsHeaders(requestOrigin: string | null): Record<string, string> {
  // Check if origin is in allowed list
  const origin = requestOrigin && ALLOWED_ORIGINS.includes(requestOrigin)
    ? requestOrigin
    : ALLOWED_ORIGINS[0]; // Fallback to primary domain

  return {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Content-Type": "application/json",
  };
}

/**
 * Rate limiting: In-memory store
 *
 * KNOWN LIMITATION (Acceptable for MVP):
 * - Resets on cold start (each new function instance = fresh rate limit)
 * - Not shared across function instances
 * - Ineffective during high traffic (multiple concurrent instances)
 *
 * FUTURE ENHANCEMENT:
 * - For production scale, consider:
 *   - Upstash Redis (serverless-friendly, free tier)
 *   - Netlify Blobs (simple key-value store)
 *   - DynamoDB (AWS) or Firestore (Google)
 */
const rateLimitStore = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const record = rateLimitStore.get(ip);

  if (!record || now > record.resetAt) {
    rateLimitStore.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return true;
  }

  if (record.count >= RATE_LIMIT_MAX_REQUESTS) {
    return false;
  }

  record.count++;
  return true;
}

// OPTIONS handler for CORS preflight
export const OPTIONS: APIRoute = async ({ request }) => {
  const origin = request.headers.get('origin');
  const corsHeaders = getCorsHeaders(origin);

  return new Response(null, {
    status: 204,
    headers: corsHeaders,
  });
};

// POST handler for contribution submissions
export const POST: APIRoute = async (context) => {
  const { request } = context;

  // Get CORS headers with origin validation
  const origin = request.headers.get('origin');
  const corsHeaders = getCorsHeaders(origin);

  try {
    // Rate limiting
    const clientIP = getClientIP(context);
    if (!checkRateLimit(clientIP)) {
      return new Response(
        JSON.stringify({ message: "Too many submissions. Please try again later." }),
        { status: 429, headers: corsHeaders }
      );
    }

    const data = await request.json();

    // Get required environment variables
    const env = getRequiredEnv([
      'SANITY_PROJECT_ID',
      'SANITY_API_TOKEN',
      'RESEND_API_KEY',
      'RESEND_FROM_EMAIL',
      'NOTIFICATION_EMAIL'
    ], context);

    // Initialize contribution service
    const contributionService = new ContributionService({
      sanityProjectId: env.SANITY_PROJECT_ID,
      sanityDataset: getEnv('SANITY_DATASET', context) || 'production',
      sanityApiToken: env.SANITY_API_TOKEN,
      sanityApiVersion: '2024-01-01',
      resendApiKey: env.RESEND_API_KEY,
      resendFromEmail: env.RESEND_FROM_EMAIL,
      notificationEmail: env.NOTIFICATION_EMAIL,
      studioUrl: getEnv('STUDIO_URL', context),
    });

    // Call contribution service
    const result = await contributionService.submitContribution(data);

    // Handle service result
    if (!result.success) {
      if (result.error) {
        logError(new Error(result.error), {
          function: 'contribute',
          operation: 'submit',
          contributionType: data.contributionType,
        }, context);
      }

      return new Response(
        JSON.stringify({ message: result.message }),
        { status: 400, headers: corsHeaders }
      );
    }

    // Success
    return new Response(
      JSON.stringify({
        message: result.message,
        id: result.contributionId,
      }),
      { status: 200, headers: corsHeaders }
    );
  } catch (error) {
    logError(error, {
      function: 'contribute',
      ip: getClientIP(context),
    }, context);

    console.error("Contribution submission error:", error);
    return new Response(
      JSON.stringify({ message: "Internal server error" }),
      { status: 500, headers: corsHeaders }
    );
  }
};
