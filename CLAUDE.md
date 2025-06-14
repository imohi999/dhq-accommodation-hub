# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Development
npm run dev          # Start development server on port 8080

# Build
npm run build        # Production build
npm run build:dev    # Development build

# Code Quality
npm run lint         # Run ESLint

# Preview
npm run preview      # Preview production build
```

## Architecture Overview

### Technology Stack
- **Frontend**: React 18.3 + TypeScript + Vite
- **UI Components**: shadcn-ui (component library)
- **Styling**: Tailwind CSS
- **State Management**: React Query (TanStack Query) for server state
- **Forms**: React Hook Form + Zod validation
- **Backend**: Supabase (PostgreSQL with Row Level Security)
- **Auth**: Supabase Auth with role-based access control

### Core Application Structure

This is a military accommodation management system with three main workflows:

1. **Queue Management**: Personnel join a queue for accommodation allocation
   - Auto-incrementing sequence numbers
   - Priority-based ordering (rank, marital status, waiting time)
   - Real-time updates via Supabase subscriptions

2. **Accommodation Units**: DHQ Living Units management
   - Housing types: 1BR, 2BR, 3BR, Duplex, Self-contained, Boys Quarter
   - Occupancy tracking and history
   - Maintenance and inventory management

3. **Allocation Workflow**: Request → Approval → Active → Past
   - Allocation requests require admin approval
   - Transfer requests between units
   - Allocation letters with digital stamps
   - Complete audit trail

### Key Patterns

**Service Layer Pattern**
- All Supabase interactions go through `/src/services/`
- Services return consistent error handling
- Real-time subscriptions for live data updates

**Custom Hooks Architecture**
- Business logic lives in `/src/hooks/`
- Hooks manage data fetching, caching, and mutations
- Example: `useQueueData`, `useAllocationRequests`, `useAccommodationData`

**Form Handling**
- React Hook Form for all forms
- Zod schemas for validation
- Toast notifications for user feedback

**Database Design**
- Row Level Security (RLS) on all tables
- JSONB columns for flexible data (dependents, history)
- Trigger functions for data integrity (queue sequence management)
- Role-based access: superadmin, admin, moderator, user

### Important Database Operations

**Queue Position Management**
- Uses RPC function `insert_at_queue_position_one` for priority insertions
- Automatic sequence reordering via triggers

**Allocation Flow**
1. Create allocation request → `allocation_requests` table
2. Admin approval → Move to `dhq_living_units` (occupied)
3. On vacation/transfer → Move to `past_allocations`

**Real-time Updates**
- Subscribe to table changes for live UI updates
- Critical for queue position changes and allocation status

### TypeScript Configuration
- Path alias: `@/` maps to `./src/`
- Relaxed type checking (be careful with null/undefined)
- Component imports use the `@/components/ui/` pattern

### Development Notes
- Lovable.dev integration for AI-assisted development
- Component tagging in development mode for debugging
- Supabase migrations in `/supabase/migrations/`