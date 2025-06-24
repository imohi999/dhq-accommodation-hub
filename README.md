# DHQ Accommodation Hub

A comprehensive military accommodation management system for Defence Headquarters (DHQ), built to streamline the allocation, management, and tracking of military accommodation units.

## 🏗️ Project Overview

The DHQ Accommodation Hub is a modern web application designed to manage military accommodation requests, unit allocations, and personnel accommodation within Defence Headquarters facilities. The system provides role-based access control, real-time data management, and comprehensive reporting capabilities.

### Key Features

- **Queue Management**: Auto-incrementing sequence system for accommodation requests
- **Unit Management**: Complete DHQ Accommodation inventory with accommodation types
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
- PostgreSQL database (see installation options below)

### Important Note: XAMPP/WAMP Compatibility

**This is a Node.js/Next.js application, NOT a PHP application.** XAMPP and WAMP are designed for PHP applications and cannot run Node.js apps directly. However, you can use XAMPP/WAMP alongside this application if you need them for other projects.

### If You Already Have XAMPP/WAMP Installed

You can still run this application! Just follow these steps:

1. **Keep XAMPP/WAMP for your PHP projects** - No need to uninstall
2. **Install Node.js separately** from [https://nodejs.org/](https://nodejs.org/)
3. **Install PostgreSQL separately** (XAMPP/WAMP include MySQL, not PostgreSQL)
4. **Run this application using Node.js** (not through XAMPP/WAMP)

The application will run on `http://localhost:5001` while XAMPP/WAMP typically uses `http://localhost:80` or `http://localhost:8080`, so they won't conflict.

### Quick Comparison

| Feature | XAMPP/WAMP | This Application |
|---------|------------|------------------|
| **Runtime** | Apache Web Server | Node.js |
| **Language** | PHP | JavaScript/TypeScript |
| **Database** | MySQL/MariaDB | PostgreSQL |
| **Port** | 80 or 8080 | 5001 |
| **Start Command** | XAMPP Control Panel | `npm run dev` |

### Database Setup Options

Since this application uses PostgreSQL (not MySQL), you'll need to install PostgreSQL separately even if you have XAMPP/WAMP installed:

#### Option 1: Direct PostgreSQL Installation (Recommended)

1. **Windows**
   ```bash
   # Download from https://www.postgresql.org/download/windows/
   # Run the installer and follow the wizard
   # Remember the password you set for postgres user
   ```

2. **macOS**
   ```bash
   # Using Homebrew
   brew install postgresql@15
   brew services start postgresql@15
   
   # Or download from https://postgresapp.com/
   ```

3. **Linux (Ubuntu/Debian)**
   ```bash
   sudo apt update
   sudo apt install postgresql postgresql-contrib
   sudo systemctl start postgresql
   ```

#### Verify PostgreSQL Installation

1. **Open a terminal/command prompt**
2. **Connect to PostgreSQL**
   ```bash
   psql -U postgres
   # Enter the password you set during installation
   ```

3. **Create the database**
   ```sql
   CREATE DATABASE dhq_accommodation_hub;
   \q
   ```

#### Database GUI Tools (Optional)

For easier database management, you can use these GUI tools:

1. **pgAdmin** (Recommended for PostgreSQL)
   - Download from [https://www.pgadmin.org/](https://www.pgadmin.org/)
   - Works with all PostgreSQL installations
   - Web-based interface

2. **DBeaver** (Universal Database Tool)
   - Download from [https://dbeaver.io/](https://dbeaver.io/)
   - Supports PostgreSQL and many other databases
   - Desktop application

3. **phpPgAdmin** (Web-based, works with XAMPP/WAMP)
   - Can be integrated with XAMPP/WAMP
   - Access via web browser
   - Similar to phpMyAdmin but for PostgreSQL

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
   # For PostgreSQL (default installation)
   DATABASE_URL="postgresql://postgres:your_password@localhost:5432/dhq_accommodation_hub"
   
   # If using XAMPP/WAMP with PostgreSQL on different port
   # DATABASE_URL="postgresql://postgres:your_password@localhost:5433/dhq_accommodation_hub"

   # NextAuth.js
   NEXTAUTH_URL="http://localhost:5001"
   NEXTAUTH_SECRET="your-nextauth-secret-here"

   # Application
   NEXT_PUBLIC_APP_URL="http://localhost:5001"
   ```

   **Note**: Replace `your_password` with the password you set during PostgreSQL installation.

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
- **dhq_living_units** - Available accommodation units
- **accommodation_types** - Types of accommodation
- **allocation_requests** - Allocation requests workflow
- **past_allocations** - Historical allocation records
- **stamp_settings** - Digital stamp configurations

### Key Relationships

- Users have Profiles (1:1)
- Queue entries link to Allocation Requests (1:1)
- Living Units have Accommodation Types (N:1)
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
- Accommodation type categorization
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

## 🔧 Troubleshooting

### Common XAMPP/WAMP Issues

1. **Port Conflicts**
   - If PostgreSQL fails to start, check if port 5432 is already in use
   - Change the port in `postgresql.conf` if needed
   - Update your `DATABASE_URL` accordingly

2. **PostgreSQL Service Not Starting (Windows)**
   ```bash
   # Open Command Prompt as Administrator
   net start postgresql-x64-15  # Replace 15 with your version
   ```

3. **Access Denied Errors**
   - Ensure the postgres user password is correct
   - Check `pg_hba.conf` for authentication settings
   - Default location: `C:\Program Files\PostgreSQL\15\data\pg_hba.conf`

4. **Database Connection Issues**
   ```bash
   # Test connection
   psql -U postgres -h localhost -p 5432 -d dhq_accommodation_hub
   
   # If connection fails, check:
   # 1. PostgreSQL service is running
   # 2. Firewall is not blocking port 5432
   # 3. Database exists and credentials are correct
   ```

5. **XAMPP/WAMP Confusion**
   - XAMPP/WAMP are for PHP applications (Apache + MySQL + PHP)
   - This is a Node.js/Next.js application - it runs on Node.js, not Apache
   - XAMPP/WAMP include MySQL/MariaDB, but this project requires PostgreSQL
   - You cannot run this application through XAMPP/WAMP's Apache server

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
