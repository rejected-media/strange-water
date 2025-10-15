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
export const OPTIONS: APIRoute = async () => {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "Content-Type",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
    },
  });
};

// POST handler for contribution submissions
export const POST: APIRoute = async (context) => {
  const { request } = context;

  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Content-Type": "application/json",
  };

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

    // Initialize contribution service
    const contributionService = new ContributionService({
      sanityProjectId: getRequiredEnv(context, 'SANITY_PROJECT_ID'),
      sanityDataset: getEnv(context, 'SANITY_DATASET') || 'production',
      sanityApiToken: getRequiredEnv(context, 'SANITY_API_TOKEN'),
      sanityApiVersion: '2024-01-01',
      resendApiKey: getRequiredEnv(context, 'RESEND_API_KEY'),
      resendFromEmail: getRequiredEnv(context, 'RESEND_FROM_EMAIL'),
      notificationEmail: getRequiredEnv(context, 'NOTIFICATION_EMAIL'),
      studioUrl: getEnv(context, 'STUDIO_URL'),
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
