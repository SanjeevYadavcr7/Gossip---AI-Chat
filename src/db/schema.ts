import { pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";

/*
    What this file does?
    This file is responsible for declaring Postgres DB schema using drizzle-orm.
    Schema Types are defined to allow type checking when instering and selecting. 
*/


export const chats = pgTable('chat', {
    id: serial('id').primaryKey(),
    userId: text('user_id').notNull(),
    message: text('message').notNull(),
    reply: text('reply').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const users = pgTable('users', {
    userId: text('user_id').primaryKey(),
    name: text('name').notNull(),
    email: text('email').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull()
})


// Type inference for drizzle queries
export type ChatInsert = typeof chats.$inferInsert;
export type ChatSelect = typeof chats.$inferSelect;
export type UserInsert = typeof users.$inferInsert;
export type UserSelect = typeof users.$inferSelect;