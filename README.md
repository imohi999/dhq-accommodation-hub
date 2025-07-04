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

### Entity Relationship Diagram

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│     User        │────┤    Profile      │────┤ PagePermission  │
└─────────────────┘ 1:1 └─────────────────┘ 1:N └─────────────────┘
        │ 1:N                    
        ├───────┤ AuthSession    
        ├───────┤ AuditLog       
        └───────┤ UserRole       

┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│     Queue       │────┤AllocationRequest│────┤  DhqLivingUnit  │
└─────────────────┘ 1:N └─────────────────┘ N:1 └─────────────────┘
        │                                               │ N:1
        │ 1:N                                          ┤ AccommodationType
        ├───────┤ UnitOccupant   ├────────────────────┘
        ├───────┤ PastAllocation ├────────────────────┘
        └───────┤ (currentOccupant) 1:1                │ 1:N
                                                       ├───┤ UnitHistory
                                                       ├───┤ UnitInventory
                                                       └───┤ UnitMaintenance

┌─────────────────┐
│  StampSetting   │ (Standalone - for digital stamps)
└─────────────────┘
```

### Key Relationships

#### Authentication & User Management
- **User ↔ Profile** (1:1) - Each user has exactly one profile
- **User → AuthSession** (1:N) - Users can have multiple active sessions
- **User → AuditLog** (1:N) - All user actions are logged
- **Profile → PagePermission** (1:N) - Profiles have granular page permissions
- **User → UserRole** (1:N) - Users can have multiple roles assigned

#### Queue & Personnel Management  
- **Queue → AllocationRequest** (1:N) - Queue entries can have multiple allocation requests
- **Queue → UnitOccupant** (1:N) - Queue entries track as unit occupants
- **Queue → PastAllocation** (1:N) - Historical allocation records
- **Queue → DhqLivingUnit** (1:1) - Current occupancy relationship

#### Accommodation Units
- **DhqLivingUnit → AccommodationType** (N:1) - Each unit has a type (1BR, 2BR, etc.)
- **DhqLivingUnit → UnitOccupant** (1:N) - Units can have multiple occupants over time
- **DhqLivingUnit → UnitHistory** (1:N) - Complete occupancy history
- **DhqLivingUnit → UnitInventory** (1:N) - Inventory items in each unit
- **DhqLivingUnit → UnitMaintenance** (1:N) - Maintenance records
- **DhqLivingUnit → AllocationRequest** (1:N) - Allocation requests for the unit
- **DhqLivingUnit → PastAllocation** (1:N) - Past allocations of the unit

#### Allocation Workflow
- **AllocationRequest → DhqLivingUnit** (N:1) - Each request is for one unit
- **AllocationRequest → Queue** (N:1) - Each request links to a queue entry
- **PastAllocation → Queue** (N:1) - Historical link to queue entry
- **PastAllocation → DhqLivingUnit** (N:1) - Historical link to unit

#### Supporting Tables
- **StampSetting** - Standalone table for digital stamp configurations
- **AccommodationType** - Master data for accommodation types
- **AllocationSequence** - Tracks allocation letter numbering

### Key Constraints & Business Rules

1. **Unique Constraints**
   - `users.username` and `users.email` must be unique
   - `queue.svcNo` (service number) must be unique
   - `queue.sequence` must be unique (auto-incremented)
   - `allocation_requests.letterId` must be unique
   - `accommodation_types.name` must be unique

2. **Cascade Deletes**
   - Deleting a user cascades to profile, sessions, and audit logs
   - Deleting a unit cascades to its history, inventory, and maintenance records
   - Deleting a profile cascades to page permissions

3. **Important Fields**
   - `queue.hasAllocationRequest` - Prevents duplicate allocation requests
   - `dhq_living_units.status` - Tracks if unit is "Vacant" or "Occupied"
   - `allocation_requests.status` - Workflow states: "pending", "approved", "refused"
   - `unit_maintenance.recordType` - Distinguishes between "request" and "task"

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

### Windows Server 2019 On-Premises Deployment

This guide covers deploying the DHQ Accommodation Hub on Windows Server 2019 in an on-premises environment.

#### Prerequisites for Windows Server 2019

1. **Windows Server 2019 Standard or Datacenter Edition**
2. **Administrator access** to the server
3. **Internet Information Services (IIS)** with IIS Node.js module
4. **Minimum server requirements:**
   - 4 GB RAM (8 GB recommended)
   - 20 GB free disk space
   - 2 CPU cores (4 recommended)

#### Step 1: Install Required Software

1. **Install Node.js LTS (v18 or v20)**
   ```powershell
   # Download Node.js installer
   Invoke-WebRequest -Uri "https://nodejs.org/dist/v20.11.0/node-v20.11.0-x64.msi" -OutFile "node-installer.msi"
   
   # Install Node.js silently
   msiexec /i node-installer.msi /qn
   
   # Verify installation
   node --version
   npm --version
   ```

2. **Install PostgreSQL 15**
   ```powershell
   # Download PostgreSQL installer
   Invoke-WebRequest -Uri "https://get.enterprisedb.com/postgresql/postgresql-15.5-1-windows-x64.exe" -OutFile "postgresql-installer.exe"
   
   # Run installer (follow GUI prompts)
   # Remember to note down:
   # - PostgreSQL port (default: 5432)
   # - PostgreSQL password for 'postgres' user
   # - Installation directory (default: C:\Program Files\PostgreSQL\15)
   ```

3. **Install Git (for deployment)**
   ```powershell
   # Download Git installer
   Invoke-WebRequest -Uri "https://github.com/git-for-windows/git/releases/download/v2.43.0.windows.1/Git-2.43.0-64-bit.exe" -OutFile "git-installer.exe"
   
   # Install Git
   Start-Process -FilePath "git-installer.exe" -ArgumentList "/VERYSILENT" -Wait
   ```

4. **Install PM2 (Process Manager)**
   ```powershell
   # Install PM2 globally
   npm install -g pm2
   
   # Install PM2 Windows Service
   npm install -g pm2-windows-startup
   pm2-startup install
   ```

#### Step 2: Configure PostgreSQL

1. **Configure PostgreSQL for network access** (if needed)
   ```powershell
   # Edit postgresql.conf
   notepad "C:\Program Files\PostgreSQL\15\data\postgresql.conf"
   
   # Add or modify:
   # listen_addresses = '*'  # or specific IP addresses
   ```

2. **Configure authentication**
   ```powershell
   # Edit pg_hba.conf
   notepad "C:\Program Files\PostgreSQL\15\data\pg_hba.conf"
   
   # Add for local network access (adjust IP range as needed):
   # host    all             all             192.168.1.0/24          md5
   ```

3. **Restart PostgreSQL service**
   ```powershell
   Restart-Service postgresql-x64-15
   ```

4. **Create database**
   ```powershell
   # Connect to PostgreSQL
   & "C:\Program Files\PostgreSQL\15\bin\psql.exe" -U postgres
   
   # In psql prompt:
   CREATE DATABASE dhq_accommodation_hub;
   \q
   ```

#### Step 3: Configure Windows Firewall

1. **Open required ports**
   ```powershell
   # Allow Node.js application port
   New-NetFirewallRule -DisplayName "DHQ Accommodation Hub" -Direction Inbound -Protocol TCP -LocalPort 5001 -Action Allow
   
   # Allow PostgreSQL if needed for remote access
   New-NetFirewallRule -DisplayName "PostgreSQL" -Direction Inbound -Protocol TCP -LocalPort 5432 -Action Allow
   ```

#### Step 4: Deploy the Application

1. **Create application directory**
   ```powershell
   New-Item -ItemType Directory -Path "C:\inetpub\dhq-accommodation-hub" -Force
   cd C:\inetpub\dhq-accommodation-hub
   ```

2. **Clone or copy the application**
   ```powershell
   # Option 1: Clone from Git repository
   git clone <repository-url> .
   
   # Option 2: Extract from deployment package
   # Copy your deployment package and extract it here
   ```

3. **Install dependencies**
   ```powershell
   npm install --production
   ```

4. **Configure environment variables**
   ```powershell
   # Create .env file
   @"
   # Database
   DATABASE_URL="postgresql://postgres:your_password@localhost:5432/dhq_accommodation_hub"
   
   # NextAuth.js
   NEXTAUTH_URL="http://your-server-name:5001"
   NEXTAUTH_SECRET="generate-a-secure-random-string-here"
   
   # Application
   NEXT_PUBLIC_APP_URL="http://your-server-name:5001"
   "@ | Out-File -Encoding UTF8 .env
   ```

5. **Build the application**
   ```powershell
   npm run build
   ```

6. **Run database migrations**
   ```powershell
   npm run db:migrate:prod
   npm run db:seed  # Only for initial setup
   ```

#### Step 5: Configure PM2 for Production

1. **Create PM2 ecosystem file**
   ```powershell
   # Create ecosystem.config.js
   @"
   module.exports = {
     apps: [{
       name: 'dhq-accommodation-hub',
       script: 'npm',
       args: 'start',
       cwd: 'C:\\inetpub\\dhq-accommodation-hub',
       instances: 2,  // Number of instances (adjust based on CPU cores)
       exec_mode: 'cluster',
       env: {
         NODE_ENV: 'production',
         PORT: 5001
       },
       error_file: 'C:\\inetpub\\dhq-accommodation-hub\\logs\\pm2-error.log',
       out_file: 'C:\\inetpub\\dhq-accommodation-hub\\logs\\pm2-out.log',
       log_file: 'C:\\inetpub\\dhq-accommodation-hub\\logs\\pm2-combined.log',
       time: true
     }]
   };
   "@ | Out-File -Encoding UTF8 ecosystem.config.js
   ```

2. **Create logs directory**
   ```powershell
   New-Item -ItemType Directory -Path "logs" -Force
   ```

3. **Start the application with PM2**
   ```powershell
   pm2 start ecosystem.config.js
   pm2 save
   ```

#### Step 6: Configure IIS as Reverse Proxy (Optional)

If you want to use IIS as a reverse proxy to serve the application on port 80/443:

1. **Install IIS and required modules**
   ```powershell
   # Install IIS
   Enable-WindowsFeature -Name Web-Server -IncludeManagementTools
   
   # Install URL Rewrite and ARR
   # Download and install manually from:
   # URL Rewrite: https://www.iis.net/downloads/microsoft/url-rewrite
   # ARR: https://www.iis.net/downloads/microsoft/application-request-routing
   ```

2. **Configure IIS site**
   - Create a new website in IIS Manager
   - Set the physical path to `C:\inetpub\dhq-accommodation-hub\public`
   - Configure URL Rewrite rules to proxy to `http://localhost:5001`

3. **Sample web.config for IIS**
   ```xml
   <?xml version="1.0" encoding="UTF-8"?>
   <configuration>
     <system.webServer>
       <rewrite>
         <rules>
           <rule name="ReverseProxyInboundRule1" stopProcessing="true">
             <match url="(.*)" />
             <action type="Rewrite" url="http://localhost:5001/{R:1}" />
           </rule>
         </rules>
       </rewrite>
     </system.webServer>
   </configuration>
   ```

#### Step 7: Configure Windows Service (Alternative to PM2)

If you prefer to run as a Windows Service instead of PM2:

1. **Install node-windows**
   ```powershell
   cd C:\inetpub\dhq-accommodation-hub
   npm install -g node-windows
   ```

2. **Create service script**
   ```powershell
   # Create service.js
   @"
   const Service = require('node-windows').Service;
   
   const svc = new Service({
     name: 'DHQ Accommodation Hub',
     description: 'DHQ Accommodation Management System',
     script: 'C:\\inetpub\\dhq-accommodation-hub\\node_modules\\next\\dist\\bin\\next',
     scriptOptions: 'start',
     nodeOptions: [
       '--max-old-space-size=4096'
     ],
     env: [
       {
         name: 'NODE_ENV',
         value: 'production'
       },
       {
         name: 'PORT',
         value: '5001'
       }
     ]
   });
   
   svc.on('install', function(){
     svc.start();
   });
   
   svc.install();
   "@ | Out-File -Encoding UTF8 service.js
   
   # Install the service
   node service.js
   ```

#### Step 8: Maintenance and Monitoring

1. **View PM2 logs**
   ```powershell
   pm2 logs dhq-accommodation-hub
   pm2 monit  # Real-time monitoring
   ```

2. **Check application status**
   ```powershell
   pm2 status
   pm2 info dhq-accommodation-hub
   ```

3. **Restart application**
   ```powershell
   pm2 restart dhq-accommodation-hub
   ```

4. **Windows Event Viewer**
   - Check Windows Event Viewer for system-level issues
   - Application logs: `Event Viewer > Applications and Services Logs`

#### Step 9: Backup and Recovery

1. **Database backup script**
   ```powershell
   # Create backup script
   @"
   `$date = Get-Date -Format "yyyy-MM-dd_HHmmss"
   `$backupPath = "C:\Backups\dhq_accommodation_hub_`$date.sql"
   
   & "C:\Program Files\PostgreSQL\15\bin\pg_dump.exe" `
     -U postgres `
     -d dhq_accommodation_hub `
     -f `$backupPath
   
   Write-Host "Backup completed: `$backupPath"
   "@ | Out-File -Encoding UTF8 backup-database.ps1
   ```

2. **Schedule automatic backups**
   ```powershell
   # Create scheduled task for daily backups
   $action = New-ScheduledTaskAction -Execute "PowerShell.exe" -Argument "-File C:\Scripts\backup-database.ps1"
   $trigger = New-ScheduledTaskTrigger -Daily -At "02:00AM"
   Register-ScheduledTask -TaskName "DHQ Database Backup" -Action $action -Trigger $trigger -RunLevel Highest
   ```

#### Security Considerations

1. **Use HTTPS in production**
   - Obtain SSL certificate
   - Configure IIS with SSL binding
   - Update all URLs to use HTTPS

2. **Harden PostgreSQL**
   - Use strong passwords
   - Limit network access
   - Enable SSL for database connections

3. **Application security**
   - Keep Node.js and dependencies updated
   - Use Windows Defender or enterprise antivirus
   - Enable Windows Firewall with specific rules

4. **Regular updates**
   ```powershell
   # Update Node.js packages
   npm update
   npm audit fix
   
   # Rebuild and restart
   npm run build
   pm2 restart dhq-accommodation-hub
   ```

#### Troubleshooting Windows Server Deployment

1. **Port already in use**
   ```powershell
   # Find process using port 5001
   netstat -ano | findstr :5001
   
   # Kill process if needed
   taskkill /PID <process-id> /F
   ```

2. **Permission issues**
   - Ensure IIS_IUSRS has read access to application directory
   - Grant write permissions to logs directory

3. **Database connection issues**
   - Verify PostgreSQL service is running
   - Check Windows Firewall rules
   - Validate connection string in .env file

4. **Application won't start**
   - Check PM2 logs: `pm2 logs`
   - Verify all environment variables are set
   - Ensure database migrations have run successfully

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
