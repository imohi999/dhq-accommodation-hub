import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

// Define all allowed actions from the application
const PAGE_ACTIONS = {
  dashboard: ['access'],
  queue: ['access'],
  'queue.list': ['access', 'add_queue', 'edit', 'delete', 'allocate', 'export'],
  'queue.units': ['access', 'add_quarters', 'edit', 'delete'],
  allocations: ['access'],
  'allocations.pending': ['access', 'view_letter', 'approve', 'refuse'],
  'allocations.active': ['access', 'view_letter', 'ejection_notice', 'transfer', 'post_out'],
  'allocations.past': ['access', 'view_letter'],
  'allocations.clearance': ['access', 'inspect', 'generate_letter'],
  'allocations.stamp-settings': ['access', 'add_stamp', 'edit', 'delete'],
  directory: ['access', 'export_data'],
  analytics: ['access'],
  'analytics.queue': ['access', 'export_report'],
  'analytics.pending': ['access', 'export_report'],
  'analytics.active-allocations': ['access', 'export_report'],
  'analytics.past-allocations': ['access', 'export_report'],
  accommodation: ['access'],
  'accommodation.units': ['access', 'add_quarters', 'edit', 'delete', 'import', 'export', 'view_history', 'maintenance_request', 'inventory'],
  'accommodation.types': ['access', 'add_type', 'edit', 'delete'],
  maintenance: ['access'],
  'maintenance.tasks': ['access', 'new_task', 'edit', 'delete', 'mark_complete'],
  'maintenance.requests': ['access', 'new_request', 'edit', 'delete', 'approve'],
  administration: ['access'],
  'administration.users': ['access', 'create_user', 'edit_permissions', 'delete_user'],
  'administration.roles': ['access', 'create_role', 'edit', 'delete'],
  'administration.audit-logs': ['access', 'export_logs'],
  'administration.auth-info': ['access', 'manage_sessions']
}

// Define all pages with their structure
const ALL_PAGES = [
  { pageKey: 'dashboard', pageTitle: 'Dashboard', parentKey: null },
  { pageKey: 'queue', pageTitle: 'Queue', parentKey: null },
  { pageKey: 'queue.list', pageTitle: 'Queue List', parentKey: 'queue' },
  { pageKey: 'queue.units', pageTitle: 'Current Units', parentKey: 'queue' },
  { pageKey: 'allocations', pageTitle: 'Allocations', parentKey: null },
  { pageKey: 'allocations.pending', pageTitle: 'Pending Approval', parentKey: 'allocations' },
  { pageKey: 'allocations.active', pageTitle: 'Active Allocations', parentKey: 'allocations' },
  { pageKey: 'allocations.past', pageTitle: 'Past Allocations', parentKey: 'allocations' },
  { pageKey: 'allocations.clearance', pageTitle: 'Clearance', parentKey: 'allocations' },
  { pageKey: 'allocations.stamp-settings', pageTitle: 'Stamp Settings', parentKey: 'allocations' },
  { pageKey: 'directory', pageTitle: 'Directory', parentKey: null },
  { pageKey: 'analytics', pageTitle: 'Analytics', parentKey: null },
  { pageKey: 'analytics.queue', pageTitle: 'Queue Analytics', parentKey: 'analytics' },
  { pageKey: 'analytics.pending', pageTitle: 'Pending Allocation Analytics', parentKey: 'analytics' },
  { pageKey: 'analytics.active-allocations', pageTitle: 'Active Allocations', parentKey: 'analytics' },
  { pageKey: 'analytics.past-allocations', pageTitle: 'Past Allocations', parentKey: 'analytics' },
  { pageKey: 'accommodation', pageTitle: 'Accommodation', parentKey: null },
  { pageKey: 'accommodation.units', pageTitle: 'DHQ Accommodation', parentKey: 'accommodation' },
  { pageKey: 'accommodation.types', pageTitle: 'Accommodation Types', parentKey: 'accommodation' },
  { pageKey: 'maintenance', pageTitle: 'Maintenance', parentKey: null },
  { pageKey: 'maintenance.tasks', pageTitle: 'Maintenance Tasks', parentKey: 'maintenance' },
  { pageKey: 'maintenance.requests', pageTitle: 'Maintenance Requests', parentKey: 'maintenance' },
  { pageKey: 'administration', pageTitle: 'Administration', parentKey: null },
  { pageKey: 'administration.users', pageTitle: 'User Management', parentKey: 'administration' },
  { pageKey: 'administration.roles', pageTitle: 'Role Profiles', parentKey: 'administration' },
  { pageKey: 'administration.audit-logs', pageTitle: 'Audit Logs', parentKey: 'administration' },
  { pageKey: 'administration.auth-info', pageTitle: 'Authentication Info', parentKey: 'administration' },
]

async function main() {
  console.log('🌱 Starting admin user creation...')

  try {
    // Check if admin user already exists
    const existingUser = await prisma.user.findUnique({
      where: { username: 'admin' }
    })

    if (existingUser) {
      console.log('⚠️  Admin user already exists. Skipping creation.')
      return
    }

    // Create superadmin user with correct bcrypt cost factor (12)
    const hashedPassword = await bcrypt.hash('DAPlogin100%', 12)

    const adminUser = await prisma.user.create({
      data: {
        username: 'admin',
        email: 'admin@dhq.mil',
        hashedPassword,
        emailVerified: new Date(),
        profile: {
          create: {
            fullName: 'System Administrator',
            role: 'superadmin'
          }
        }
      },
      include: {
        profile: true
      }
    })

    console.log('✅ Created superadmin user:')
    console.log('   Email:', adminUser.email)
    console.log('   Username: admin')
    console.log('   Password: password123')
    console.log('   Role: superadmin')

    // Get the admin's profile
    if (adminUser.profile) {
      try {
        // Create page permissions with all allowed actions
        for (const page of ALL_PAGES) {
          const allowedActions = PAGE_ACTIONS[page.pageKey as keyof typeof PAGE_ACTIONS] || ['access']

          await prisma.pagePermission.create({
            data: {
              profileId: adminUser.profile.id,
              pageKey: page.pageKey,
              pageTitle: page.pageTitle,
              parentKey: page.parentKey,
              canView: true,
              canEdit: true,
              canDelete: true,
              allowedActions: allowedActions
            }
          })
        }

        console.log('✅ Created page permissions for superadmin')
        console.log(`   Total permissions: ${ALL_PAGES.length}`)

        // Log all the allowed actions for verification
        console.log('\n📋 Page permissions created:')
        for (const [pageKey, actions] of Object.entries(PAGE_ACTIONS)) {
          console.log(`   ${pageKey}: ${actions.join(', ')}`)
        }

      } catch (e) {
        console.log('⚠️  Could not create page permissions:', e)
      }
    }

    console.log('\n🎉 Admin user creation completed!')
    console.log('\n🔐 Login credentials:')
    console.log('   URL: http://localhost:8080')
    console.log('   Username: admin')
    console.log('   Password: password123')

  } catch (error) {
    console.error('❌ Error creating admin user:', error)
    throw error
  }
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })