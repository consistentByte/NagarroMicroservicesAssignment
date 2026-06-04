import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  constructor() {
    // 1. Establish a native PostgreSQL connection pool using your active env string
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
    });

    // 2. Initialize the Prisma 7 specific driver adapter
    const adapter = new PrismaPg(pool);

    // 3. Pass the adapter block directly into the parent constructor
    super({ adapter });
  }

  onModuleInit() {
    this.$connect()
      .then(() => console.log('Connected to DB'))
      .catch((err) => console.log(err));
  }
}
