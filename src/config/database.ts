import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { config } from 'dotenv';

config({path: '.env'});

if(!process.env.DATABASE_URL) {
    throw new Error('DATABASE URL is undefined.')
}

// Init Neon Client
const sql = neon(process.env.DATABASE_URL);


// Init Drizzle
export const db = drizzle(sql);