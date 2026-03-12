import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import bcrypt from "bcryptjs";
import "dotenv/config";

const connectionString = `${process.env.DATABASE_URL}`;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
    // Create Super Admin
    const hashedPassword = await bcrypt.hash("admin123", 10);
    const admin = await prisma.user.upsert({
        where: { email: "admin@uplift4media.com" },
        update: {},
        create: {
            email: "admin@uplift4media.com",
            name: "UPLIFT Admin",
            password: hashedPassword,
            role: "SUPER_ADMIN",
        },
    });

    console.log("Admin user created/verified:", admin.email);

    // Create Initial Services
    const services = [
        {
            name: "Instagram Account Recovery",
            slug: "instagram-recovery",
            platform: "INSTAGRAM",
            category: "Recovery",
            defaultPrice: 500,
            defaultCost: 200,
            requiresTargetUser: true,
            requiresEmail: true,
        },
        {
            name: "Meta Verified Setup",
            slug: "meta-verified",
            platform: "INSTAGRAM",
            category: "Certification",
            defaultPrice: 1000,
            defaultCost: 400,
            requiresTargetUser: true,
        },
        {
            name: "TikTok Account Recovery",
            slug: "tiktok-recovery",
            platform: "TIKTOK",
            category: "Recovery",
            defaultPrice: 400,
            defaultCost: 150,
            requiresTargetUser: true,
        },
        {
            name: "Reputation Management",
            slug: "reputation-mgmt",
            platform: "OTHER",
            category: "Management",
            defaultPrice: 2000,
            defaultCost: 800,
            requiresCaseNotes: true,
        },
    ];

    for (const service of services) {
        await prisma.service.upsert({
            where: { slug: service.slug },
            update: {},
            create: service as any,
        });
    }

    console.log("Seed data created successfully");
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
        await pool.end();
    });
