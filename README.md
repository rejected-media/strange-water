# Podcast Template

**A ready-to-use template for creating beautiful podcast websites** built with [Podcast Framework](https://github.com/rejected-media/podcast-framework).

---

## 🚀 Quick Start

### 1. Use This Template

Click the **"Use this template"** button above to create your own repository.

### 2. Clone Your Repository

```bash
git clone https://github.com/YOUR_USERNAME/your-podcast.git
cd your-podcast
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Set Up Sanity CMS

Create a Sanity project at [sanity.io/manage](https://sanity.io/manage)

1. Click "Create Project"
2. Name your project
3. Copy the Project ID

### 5. Configure Environment Variables

```bash
# Copy the template
cp .env.template .env.local

# Edit .env.local and add your credentials
nano .env.local
```

**Required variables:**
- `SANITY_PROJECT_ID` - Your Sanity project ID
- `SANITY_DATASET` - Usually "production"
- `SANITY_TOKEN` - Create a token in Sanity dashboard

### 6. Start Development Servers

**Start the website:**
```bash
npm run dev
```

Open [http://localhost:4321](http://localhost:4321)

**Start Sanity Studio (in another terminal):**
```bash
npm run sanity:dev
```

Open [http://localhost:3333](http://localhost:3333)

---

## 🎛️ Sanity Studio

### Local Development

The Sanity Studio is your content management interface. Run it locally to add/edit episodes:

```bash
npm run sanity:dev
```

This starts the Studio at http://localhost:3333

### Deploy Studio to Sanity Cloud

To make your Studio accessible from anywhere (recommended for production):

1. Make sure your `.env.local` has correct credentials
2. Deploy to Sanity Cloud:
   ```bash
   npm run sanity:deploy
   ```
3. Follow the prompts to choose a studio hostname
4. Your Studio will be available at `https://your-studio.sanity.studio`

The free tier includes unlimited Studio hosting.

### Studio Features

- Create and edit podcast episodes
- Manage guests and hosts
- Configure podcast metadata
- Upload audio files
- Add episode transcripts
- Rich text editing for show notes

---

## 📦 What's Included

### Framework Packages

- **@podcast-framework/core** - Components, layouts, utilities
- **@podcast-framework/sanity-schema** - CMS schemas
- **Astro 5** - Static site generator
- **Sanity 3** - Headless CMS

### Components (8)

- Header - Navigation with mobile menu
- Footer - Social links and newsletter
- NewsletterSignup - Email subscription
- EpisodeSearch - Client-side search
- TranscriptViewer - Transcript display
- FeaturedEpisodesCarousel - Episode carousel
- SkeletonLoader - Loading states
- BlockContent - Rich text renderer

### Features

- ✅ SEO optimized (meta tags, Schema.org)
- ✅ Google Analytics 4 ready
- ✅ Responsive design
- ✅ Accessibility (WCAG 2.1 AA)
- ✅ Episode transcripts
- ✅ Newsletter signup
- ✅ Community contributions
- ✅ Multi-cloud deployment (Cloudflare/Vercel/Netlify)

---

## 🎨 Customization

### Override Components

Create `src/components/ComponentName.astro` to override any framework component:

```astro
---
// src/components/Header.astro
---
<header class="custom-header">
  <!-- Your custom header -->
</header>
```

The framework automatically uses your version!

### Extend Schemas

```typescript
// sanity/sanity.config.ts
import { extendEpisodeSchema } from '@podcast-framework/sanity-schema';

const episode = extendEpisodeSchema([
  {
    name: 'sponsor',
    type: 'reference',
    to: [{ type: 'sponsor' }]
  }
]);
```

### Configure Features

Edit `podcast.config.js` to enable/disable features:

```javascript
features: {
  transcripts: true,
  newsletter: true,
  search: true,
  comments: false  // Disable comments
}
```

---

## 🚢 Deployment

### Cloudflare Pages (Recommended)

1. Push your code to GitHub
2. Go to [Cloudflare Dashboard](https://dash.cloudflare.com/pages)
3. Click "Create a project"
4. Connect your GitHub repository
5. Configure:
   - Build command: `npm run build`
   - Build output directory: `dist`
6. Add environment variables (SANITY_PROJECT_ID, etc.)
7. Deploy!

### Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/rejected-media/podcast-template)

### Netlify

[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/rejected-media/podcast-template)

---

## 📚 Documentation

### Framework Documentation

- [Main Repository](https://github.com/rejected-media/podcast-framework)
- [Component Reference](https://github.com/rejected-media/podcast-framework/blob/main/packages/core/COMPONENTS.md)
- [CLI Commands](https://github.com/rejected-media/podcast-framework/blob/main/packages/cli/README.md)

### Guides

- **Setup Guide:** See [Quick Start](#quick-start) above
- **Deployment Guide:** See [Deployment](#deployment) above
- **Customization:** See [Customization](#customization) above

---

## 🛠️ CLI Commands

The framework includes a CLI tool for common tasks:

```bash
# Validate your project
npx @podcast-framework/cli validate

# List available components
npx @podcast-framework/cli list-components

# Override a component
npx @podcast-framework/cli override Header

# Check for framework updates
npx @podcast-framework/cli check-updates

# Update framework packages
npx @podcast-framework/cli update
```

---

## 🤝 Contributing

Found a bug or want to contribute? Visit the [main repository](https://github.com/rejected-media/podcast-framework).

---

## 📄 License

MIT License - see [LICENSE](./LICENSE)

---

## 🙏 Built With

- [Podcast Framework](https://github.com/rejected-media/podcast-framework)
- [Astro](https://astro.build)
- [Sanity](https://www.sanity.io)
- [Tailwind CSS](https://tailwindcss.com)

---

**Happy podcasting! 🎙️**
