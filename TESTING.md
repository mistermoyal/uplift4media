# Testing Guide: UPLIFT4MEDIA CRM

Follow these steps to set up and test the CRM dashboard in your local environment.

## 1. Prerequisites
- **Node.js**: Ensure you have Node.js 18+ installed.
- **PostgreSQL**: You need a running PostgreSQL database. You can use a local instance or a cloud provider (e.g., Supabase, Neon, or Vercel Postgres).

## 2. Environment Setup

Update your `.env` file in the project root:

```env
# Database connection string
DATABASE_URL="postgresql://user:password@localhost:5432/uplift_crm"

# NextAuth configuration
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="any-random-long-string-for-development"
```

## 3. Database Initialization

Run the following commands to set up the schema and seed initial data:

```bash
# Generate the Prisma client
npx prisma generate

# Push the schema to your database
npx prisma db push

# Seed the database with the admin user and initial services
npx prisma db seed
```

## 4. Run the Application

Start the development server:

```bash
npm run dev
```

The application will be available at [http://localhost:3000](http://localhost:3000).

## 5. Test Workflow

### A. Login
- **URL**: [http://localhost:3000/login](http://localhost:3000/login)
- **Email**: `admin@uplift4media.com`
- **Password**: `admin123`

### B. Create a Client
1. Navigate to **Clients** in the sidebar.
2. Click **Create Client**.
3. Fill in the details for a test client and save.

### C. Verify Services
1. Navigate to **Services**.
2. Ensure the seeded services (Instagram Recovery, etc.) are visible.
3. (Optional) Create a new custom service.

### D. Create an Order
1. Navigate to **Orders**.
2. Click **Create Order**.
3. Select your test client and a service.
4. Fill in the case details (Username, Platform, etc.) and save.

### E. Manage the Case
1. Click **View Details** on the new order.
2. Update the **Status** using the dropdown in the header.
3. Add an **Internal Note** in the notes tab.
4. Verify all actions are logged in the **Activity Log** tab.
