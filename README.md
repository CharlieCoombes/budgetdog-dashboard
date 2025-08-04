# Budgetdog Analytics Dashboard

A modern, fast-loading analytics dashboard built with Next.js and TypeScript for tracking Budgetdog subscription metrics.

## Features

- ⚡ **Lightning Fast** - Optimized API calls with intelligent caching
- 🎨 **Modern Design** - Clean, responsive UI inspired by modern analytics dashboards  
- 📊 **Rich Visualizations** - Interactive charts and metrics cards
- 🔄 **Real-time Updates** - Live data with manual refresh capability
- 📱 **Mobile Responsive** - Works seamlessly on all devices
- 🔒 **Secure** - Environment-based configuration for API keys

## Key Metrics Tracked

- Monthly Recurring Revenue (MRR)
- Active/Trialing/Cancelled subscriptions
- Conversion rates and LTV calculations
- Product-specific breakdowns
- Take rate analysis for Budgetdog Academy

## Quick Start

1. **Clone and Install**
   ```bash
   cd budgetdog-dashboard
   npm install
   ```

2. **Environment Setup**
   ```bash
   cp .env.local.example .env.local
   ```
   Add your Stripe secret key to `.env.local`:
   ```
   STRIPE_SECRET_KEY=sk_live_your_actual_stripe_key_here
   ```

3. **Development Server**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000)

4. **Production Build**
   ```bash
   npm run build
   npm start
   ```

## Performance Optimizations

- **Intelligent Caching**: 10-minute cache for Stripe API calls
- **Parallel Processing**: Concurrent API requests by subscription status
- **Optimized Queries**: Filtered queries to reduce data transfer
- **Client-side Caching**: React state management for fast UI updates
- **Lazy Loading**: Components load as needed

## Architecture

```
src/
├── app/
│   ├── api/metrics/     # API endpoints for data fetching
│   ├── globals.css      # Global styles
│   ├── layout.tsx       # Root layout
│   └── page.tsx         # Main dashboard page
├── components/
│   ├── Charts.tsx       # Chart components (Bar, Pie, Line)
│   └── MetricCard.tsx   # Metric display cards
├── types/
│   └── dashboard.ts     # TypeScript type definitions
└── lib/                 # Utility functions
```

## API Endpoints

- `GET /api/metrics` - Fetch all dashboard metrics
- `DELETE /api/metrics` - Clear cache (useful for development)

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `STRIPE_SECRET_KEY` | Stripe API secret key | ✅ |

## Deployment

This is a standard Next.js application and can be deployed to:

- **Vercel** (recommended): `vercel --prod`
- **Netlify**: Connect your repository 
- **AWS/GCP/Azure**: Use Docker or serverless deployment

## Performance Comparison

| Metric | Old Dashboard (Streamlit) | New Dashboard (Next.js) |
|--------|---------------------------|-------------------------|
| Initial Load | ~15-30 seconds | ~2-3 seconds |
| Refresh Time | ~10-15 seconds | ~1-2 seconds |
| UI Responsiveness | Basic | Modern & Interactive |
| Mobile Support | Limited | Full Responsive |
| Caching | Basic (10min) | Intelligent Multi-layer |

## Development

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript for type safety
- **Styling**: Tailwind CSS for rapid UI development
- **Charts**: Recharts for interactive visualizations
- **Icons**: Lucide React for consistent iconography

## Support

For issues or questions, please check the existing configuration in the original Python dashboard for reference to Stripe product IDs and excluded email lists.