/**
 * Sanity CLI Configuration
 *
 * This file is used by the Sanity CLI for deployment and management commands.
 * It references the same configuration as your Studio.
 */

import { defineCliConfig } from 'sanity/cli';

export default defineCliConfig({
  api: {
    projectId: process.env.SANITY_PROJECT_ID || '',
    dataset: process.env.SANITY_DATASET || 'production'
  }
});
