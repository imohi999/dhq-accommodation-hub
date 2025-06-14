// Initialize Prisma for SQL Server
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔧 Initializing Prisma for SQL Server...\n');

try {
  // Check if .env exists
  const envPath = path.join(__dirname, '..', '.env');
  if (!fs.existsSync(envPath)) {
    console.log('📝 Creating .env file from .env.example...');
    const envExample = fs.readFileSync(path.join(__dirname, '..', '.env.example'), 'utf8');
    fs.writeFileSync(envPath, envExample);
    console.log('✅ .env file created. Please update the DATABASE_URL with your SQL Server credentials.\n');
  }

  // Generate Prisma Client
  console.log('🏗️  Generating Prisma Client...');
  execSync('npx prisma generate', { stdio: 'inherit' });
  
  console.log('\n✅ Prisma initialized successfully!');
  console.log('\n📋 Next steps:');
  console.log('1. Start SQL Server: docker-compose up -d');
  console.log('2. Wait for SQL Server to be ready (check logs: docker-compose logs -f mssql)');
  console.log('3. Push the schema to database: npx prisma db push');
  console.log('4. Run the constraints SQL manually in SQL Server');
  console.log('5. (Optional) Seed initial data: npx prisma db seed');
  
} catch (error) {
  console.error('❌ Error initializing Prisma:', error.message);
  process.exit(1);
}