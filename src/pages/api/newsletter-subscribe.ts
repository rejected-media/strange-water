import type { APIRoute } from 'astro';
import {
  NewsletterService,
  getRequiredEnv,
  getEnv,
  logError
} from '@podcast-framework/core';

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

// POST handler for newsletter subscriptions
export const POST: APIRoute = async (context) => {
  const { request } = context;

  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Content-Type": "application/json",
  };

  try {
    const data = await request.json();

    // Initialize newsletter service
    const newsletterService = new NewsletterService({
      sanityProjectId: getRequiredEnv(context, 'SANITY_PROJECT_ID'),
      sanityDataset: getEnv(context, 'SANITY_DATASET') || 'production',
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
