# Supabase Database Setup

## Running Migrations

To set up the database schema, run the migration SQL file in your Supabase SQL Editor:

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Create a new query
4. Copy and paste the contents of `migrations/001_initial_schema.sql`
5. Click **Run** to execute the migration

Alternatively, if you have the Supabase CLI installed:

```bash
supabase db reset  # For local development
# OR
supabase db push   # To push changes to remote
```

## Schema Overview

The migration creates the following tables:

- **users** - User profiles (extends Supabase auth.users)
- **projects** - Writing projects (novels, essays, stories, etc.)
- **entities** - Characters, locations, themes, plot points, etc.
- **publishing_connections** - Platform integrations (KDP, Substack, etc.)
- **publishing_schedules** - Scheduled publishing across platforms
- **analytics_snapshots** - Performance metrics tracking

All tables have Row Level Security (RLS) enabled to ensure users can only access their own data.

## Subscription Tier Limits

Implement these limits in application logic:

### Free Tier
- Max 3 projects
- Max 1 publishing platform connection
- No AI features

### Pro Tier ($9.99/mo)
- Unlimited projects
- Max 5 publishing platform connections
- No AI features

### Plus Tier ($24.99/mo)
- Unlimited projects
- Unlimited publishing platform connections
- Full AI features
- Community access
