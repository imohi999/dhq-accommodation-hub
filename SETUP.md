# Authentication Setup

## Required Environment Variables

Make sure you have the following environment variables set in your `.env` file:

```bash
# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-here

# Database
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/dhq_accommodation?schema=public
```

## Generate NEXTAUTH_SECRET

You can generate a secure secret using one of these methods:

### Option 1: Using OpenSSL
```bash
openssl rand -base64 32
```

### Option 2: Using Node.js
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

### Option 3: Using an online generator
Visit: https://generate-secret.vercel.app/32

## Important Notes

1. **NEXTAUTH_SECRET** must be set for production deployments
2. In development, if NEXTAUTH_SECRET is not set, NextAuth will use a default value but will show warnings
3. The secret should be at least 32 characters long
4. Never commit your actual secret to version control

## Testing Authentication

1. Make sure the database is running and seeded
2. Default admin credentials (from seed):
   - Username: `admin`
   - Password: `admin123`

## Troubleshooting

If you're experiencing session issues:

1. Clear browser cookies and local storage
2. Restart the development server
3. Ensure NEXTAUTH_SECRET is properly set
4. Check that the database connection is working
5. Verify the user exists in the database