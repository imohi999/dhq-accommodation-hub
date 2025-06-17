# DHQ Accommodation Hub

A comprehensive military accommodation management system for Defence Headquarters (DHQ), built to streamline the allocation, management, and tracking of military accomodation units.

## 🏗️ Project Overview

The DHQ Accommodation Hub is a modern web application designed to manage military accommodation requests, unit allocations, and personnel accomodation within Defence Headquarters facilities. The system provides role-based access control, real-time data management, and comprehensive reporting capabilities.

### Key Features

- **Queue Management**: Auto-incrementing sequence system for accommodation requests
- **Unit Management**: Complete DHQ Accommodation inventory with accomodation types
- **Allocation Workflow**: Request → Approval → Active → Past allocation lifecycle
- **Transfer Management**: Personnel transfer between units with proper tracking
- **Audit Trail**: Complete history of all allocation activities
- **Role-based Access**: Superadmin, Admin, Moderator, and User roles
- **Real-time Updates**: Live data synchronization across the application
- **Digital Letters**: Auto-generated allocation letters with digital stamps

## 🛠️ Technology Stack

### Frontend

- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first CSS framework
- **shadcn/ui** - Modern component library
- **SWR** - Data fetching and caching
- **React Hook Form** - Form handling with Zod validation

### Backend

- **Next.js API Routes** - Server-side API endpoints
- **Prisma** - Type-safe database ORM
- **PostgreSQL** - Primary database
- **NextAuth.js** - Authentication and session management
- **bcryptjs** - Password hashing

### Infrastructure

- **Vercel** - Deployment platform
- **Database** - PostgreSQL with connection pooling
- **File Storage** - Next.js static assets

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn
- PostgreSQL database

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd dhq-accommodation-hub
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**

   ```bash
   cp .env.example .env
   ```

   Update `.env` with your configuration:

   ```env
   # Database
   DATABASE_URL="postgresql://username:password@localhost:5432/dhq_accommodation_hub"

   # NextAuth.js
   NEXTAUTH_URL="http://localhost:5001"
   NEXTAUTH_SECRET="your-nextauth-secret-here"

   # Application
   NEXT_PUBLIC_APP_URL="http://localhost:5001"
   ```

4. **Set up the database**

   ```bash
   # Generate Prisma client
   npm run db:generate

   # Run migrations
   npm run db:migrate

   # Seed the database
   npm run db:seed
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

The application will be available at `http://localhost:5001`

### Default Admin Credentials

After seeding, use these credentials to access the system:

- **Email**: `admin@dhq.mil`
- **Password**: `admin123`
- **Role**: Superadmin

## 📁 Project Structure

```
src/
├── app/                     # Next.js App Router
│   ├── (auth)/             # Authentication pages
│   ├── (dashboard)/        # Protected dashboard pages
│   ├── api/                # API routes
│   └── globals.css         # Global styles
├── components/             # React components
│   ├── ui/                 # Base UI components (shadcn/ui)
│   ├── accommodation/      # Accommodation management
│   ├── allocation/         # Allocation workflow
│   └── queue/              # Queue management
├── hooks/                  # Custom React hooks
├── lib/                    # Utility libraries
├── services/               # API service layer
├── types/                  # TypeScript type definitions
└── utils/                  # Utility functions

prisma/
├── migrations/             # Database migrations
├── schema.prisma          # Prisma schema
└── seed.ts               # Database seeding

docs/                      # Documentation
```

## 🗄️ Database Schema

### Core Tables

- **users** - System users and authentication
- **profiles** - User profiles and roles
- **queue** - Accommodation request queue
- **dhq_living_units** - Available accomodation units
- **accomodation_types** - Types of accommodation
- **allocation_requests** - Allocation requests workflow
- **past_allocations** - Historical allocation records
- **stamp_settings** - Digital stamp configurations

### Key Relationships

- Users have Profiles (1:1)
- Queue entries link to Allocation Requests (1:1)
- Living Units have Accomodation Types (N:1)
- Allocation Requests link to Units and Queue (N:1)
- Past Allocations store historical data

## 🔐 Authentication & Authorization

### Roles

1. **Superadmin** - Full system access
2. **Admin** - User management, approvals, configurations
3. **Moderator** - Queue management, basic approvals
4. **User** - View-only access, personal requests

### Protected Routes

All dashboard routes require authentication. Role-based access controls specific features:

- Queue management requires Moderator+
- Allocation approvals require Admin+
- User management requires Superadmin
- System settings require Admin+

## 🔄 Core Workflows

### 1. Accommodation Request Flow

```
Personnel → Queue Entry → Allocation Request → Admin Approval → Active Allocation → Past Allocation
```

### 2. Transfer Request Flow

```
Current Unit → Transfer Request → Admin Approval → Move to Past Allocations + New Active Allocation
```

### 3. Deallocation Flow

```
Active Allocation → Deallocation Request → Move to Past Allocations + Clear Unit
```

## 📊 Key Features

### Queue Management

- Auto-incrementing sequence numbers
- Priority-based ordering (rank, marital status, wait time)
- Real-time queue position updates
- Bulk operations support

### Unit Management

- Comprehensive unit inventory
- Accomodation type categorization
- Occupancy tracking
- Maintenance and inventory logs
- Image management for blocks

### Allocation System

- Digital allocation letters
- Automated letter ID generation
- Approval workflow with comments
- Transfer request handling
- Complete audit trail

### Reporting & Analytics

- Summary dashboards
- Historical allocation reports
- Unit occupancy statistics
- Personnel allocation history

## 🛠️ Development

### Available Scripts

```bash
# Development
npm run dev              # Start development server on port 5001

# Build & Production
npm run build           # Production build with migrations
npm run start           # Start production server
npm run preview         # Preview production build

# Database
npm run db:generate     # Generate Prisma client
npm run db:migrate      # Run development migrations
npm run db:migrate:prod # Deploy production migrations
npm run db:push         # Sync schema (development only)
npm run db:seed         # Seed database with sample data
npm run db:studio       # Open Prisma Studio

# Code Quality
npm run lint            # Run ESLint
```

### Development Guidelines

1. **Code Style**: Follow TypeScript and ESLint configurations
2. **Components**: Use shadcn/ui components as base, create custom variants in `components/`
3. **API Routes**: Follow RESTful conventions, use proper HTTP status codes
4. **Database**: Always create migrations for schema changes
5. **Types**: Define TypeScript interfaces in `types/` directory
6. **Hooks**: Create reusable hooks in `hooks/` directory

## 🚀 Deployment

### Production Environment

1. **Database Setup**

   ```bash
   # Set production DATABASE_URL
   # Run migrations
   npm run db:migrate:prod
   ```

2. **Environment Variables**

   - Set all required environment variables
   - Use strong secrets for NEXTAUTH_SECRET
   - Configure proper DATABASE_URL

3. **Build Process**
   ```bash
   npm run build
   npm run start
   ```

### Vercel Deployment

1. Connect repository to Vercel
2. Configure environment variables
3. Set build command: `npm run build`
4. Set install command: `npm install`

The build process automatically:

- Generates Prisma client
- Runs database migrations
- Builds the Next.js application

## 📋 API Documentation

### Authentication Endpoints

- `POST /api/auth/signin` - User sign in
- `POST /api/auth/signout` - User sign out
- `GET /api/auth/session` - Current session

### Queue Management

- `GET /api/queue` - List queue entries
- `POST /api/queue` - Create queue entry
- `PUT /api/queue/[id]` - Update queue entry
- `DELETE /api/queue/[id]` - Remove from queue

### Allocation Management

- `GET /api/allocations/requests` - List allocation requests
- `POST /api/allocations/requests` - Create allocation request
- `PATCH /api/allocations/requests/[id]` - Approve/refuse request
- `GET /api/allocations/past` - List past allocations

### Unit Management

- `GET /api/dhq-living-units` - List all units
- `GET /api/dhq-living-units/[id]` - Get unit details
- `PUT /api/dhq-living-units/[id]` - Update unit

## 🔧 Configuration

### Environment Variables

| Variable              | Description                  | Required |
| --------------------- | ---------------------------- | -------- |
| `DATABASE_URL`        | PostgreSQL connection string | Yes      |
| `NEXTAUTH_URL`        | Application URL for NextAuth | Yes      |
| `NEXTAUTH_SECRET`     | Secret for JWT signing       | Yes      |
| `NEXT_PUBLIC_APP_URL` | Public application URL       | Yes      |

### Database Configuration

The application uses PostgreSQL with Prisma ORM. Connection pooling is recommended for production deployments.

## 📖 Additional Documentation

- [Setup Guide](./SETUP.md) - Detailed setup instructions
- [Debugging Guide](./docs/debugging-allocation-flow.md) - Troubleshooting allocation issues
- [Queue API Testing](./docs/queue-api-testing.md) - API testing documentation

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is proprietary software for Defence Headquarters use.

## 📞 Support

For technical support or questions:

- Create an issue in the repository
- Contact the development team
- Refer to the documentation in `/docs`

---

**DHQ Accommodation Hub** - Streamlining military accommodation management for Defence Headquarters.
