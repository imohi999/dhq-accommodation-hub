import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function checkStatusValues() {
  try {
    // Get all unique status values
    const statusCounts = await prisma.$queryRaw`
      SELECT status, COUNT(*) as count 
      FROM allocation_requests 
      GROUP BY status
      ORDER BY count DESC
    `;
    
    console.log('=== STATUS VALUES IN DATABASE ===');
    statusCounts.forEach(row => {
      console.log(`Status: "${row.status}" - Count: ${row.count}`);
    });
    
    // Get the most recent 5 allocation requests
    const recent = await prisma.allocationRequest.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: {
        id: true,
        status: true,
        createdAt: true,
        letterId: true
      }
    });
    
    console.log('\n=== MOST RECENT 5 ALLOCATION REQUESTS ===');
    recent.forEach(req => {
      console.log(`${req.letterId}: status="${req.status}" (created: ${req.createdAt.toISOString()})`);
    });
    
    // Check specifically for 'pending' status (exact match)
    const pendingExact = await prisma.allocationRequest.count({
      where: { status: 'pending' }
    });
    
    // Check with LIKE to see if there are any variations
    const pendingLike = await prisma.$queryRaw`
      SELECT COUNT(*) as count 
      FROM allocation_requests 
      WHERE status LIKE '%pending%'
    `;
    
    console.log('\n=== PENDING STATUS CHECKS ===');
    console.log('Exact match for "pending":', pendingExact);
    console.log('LIKE match for "%pending%":', pendingLike[0].count);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkStatusValues();