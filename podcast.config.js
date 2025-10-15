/**
 * Podcast Configuration
 *
 * Configure your podcast settings here.
 * All settings can be customized to match your podcast.
 */

export default {
  // Basic Information
  name: "My Podcast",
  tagline: "Great conversations about interesting topics",
  description: "Weekly episodes featuring expert guests and deep dives into fascinating subjects.",

  // URLs
  domain: "my-podcast.com",
  url: "https://my-podcast.com",

  // Sanity CMS Configuration
  sanity: {
    projectId: process.env.SANITY_PROJECT_ID || '',
    dataset: process.env.SANITY_DATASET || 'production',
    apiVersion: '2024-01-01',
  },

  // Feature Flags
  // Enable/disable features for your podcast
  features: {
    transcripts: true,          // Episode transcripts
    newsletter: true,            // Newsletter signup forms
    contributions: true,         // Community contribution forms
    search: true,                // Episode search
    comments: false,             // Comments (requires setup)
    platformLinks: {
      spotify: true,
      apple: true,
      youtube: true,
    }
  },

  // Third-Party Integrations
  integrations: {
    // Google Analytics
    analytics: {
      provider: 'google',
      measurementId: process.env.GA_MEASUREMENT_ID,
    },

    // Newsletter Provider (ConvertKit, Mailchimp, etc.)
    newsletter: {
      provider: 'convertkit',
      apiKey: process.env.CONVERTKIT_API_KEY,
      formId: process.env.CONVERTKIT_FORM_ID,
    },

    // Transcript Generation (OpenAI Whisper, AssemblyAI)
    transcripts: {
      provider: 'whisper',
      apiKey: process.env.OPENAI_API_KEY,
    }
  },

  // Theme
  // Use default theme or specify custom theme package
  theme: '@podcast-framework/theme-default',

  // Deployment
  deployment: {
    provider: 'cloudflare-pages',
    branch: 'main',
  },

  // SEO & Social
  seo: {
    defaultImage: '/og-image.png',
    twitterHandle: '@mypodcast',
  }
};
