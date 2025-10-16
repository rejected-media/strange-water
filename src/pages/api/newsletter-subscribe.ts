export const prerender = false;

import type { APIRoute } from 'astro';
import {
  NewsletterService,
  getRequiredEnv,
  getEnv,
  logError
} from '@rejected-media/podcast-framework-core';

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

// OPTIONS handler for CORS preflight
export const OPTIONS: APIRoute = async ({ request }) => {
  const origin = request.headers.get('origin');
  const corsHeaders = getCorsHeaders(origin);

  return new Response(null, {
    status: 204,
    headers: corsHeaders,
  });
};

// POST handler for newsletter subscriptions
export const POST: APIRoute = async (context) => {
  const { request } = context;

  // Get CORS headers with origin validation
  const origin = request.headers.get('origin');
  const corsHeaders = getCorsHeaders(origin);

  try {
    const data = await request.json();

    // Get required environment variables
    const env = getRequiredEnv(['SANITY_PROJECT_ID'], context);

    // Initialize newsletter service
    const newsletterService = new NewsletterService({
      sanityProjectId: env.SANITY_PROJECT_ID,
      sanityDataset: getEnv('SANITY_DATASET', context) || 'production',
      sanityApiVersion: '2024-01-01',
    });

    // Call newsletter service
    const result = await newsletterService.subscribe({
      email: data.email,
      website: data.website, // Honeypot
    });

    // Handle service result
    if (!result.success) {
      if (result.error) {
        logError(new Error(result.error), {
          function: 'newsletter-subscribe',
          operation: 'subscribe',
        }, context);
      }

      return new Response(
        JSON.stringify({ message: result.message }),
        { status: 400, headers: corsHeaders }
      );
    }

    // Success
    return new Response(
      JSON.stringify({ message: result.message }),
      { status: 200, headers: corsHeaders }
    );
  } catch (error) {
    logError(error, {
      function: 'newsletter-subscribe',
    }, context);

    console.error("Newsletter subscription error:", error);
    return new Response(
      JSON.stringify({ message: "Unable to process subscription. Please try again later." }),
      { status: 500, headers: corsHeaders }
    );
  }
};
