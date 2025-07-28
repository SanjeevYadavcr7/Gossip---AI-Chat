import { config } from 'dotenv';
import { defineConfig } from 'drizzle-kit';

config({path: '.env', quiet: true});

/*
    This file is the configuration file for Drizzle Kit. It defines 
    essential settings such as which database to connect to, where 
    the schema is located, and where to output generated migration files. 
    It tells Drizzle how to interact with your database and manage migrations.
*/

export default defineConfig({
    schema: './src/db/schema.ts',
    out: './migrations',
    dialect: 'postgresql',
    dbCredentials: {
        url: process.env.DATABASE_URL!
    }
});