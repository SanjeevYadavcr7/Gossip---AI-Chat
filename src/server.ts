import express, {Request, Response} from 'express';
import cors from 'cors';
import OpenAI from 'openai';
import dotenv from 'dotenv';
import { eq } from 'drizzle-orm';
import { StreamChat } from 'stream-chat'; 
import { ChatCompletionMessageParam } from 'openai/resources';

import { db } from './config/database';
import { chats, users } from './db/schema';

dotenv.config({path: ['.env'], quiet: true});

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({extended: false}));


// Initialize Stream client and OpenAI
const chatClient = StreamChat.getInstance(
    process.env.STREAM_API_KEY!, 
    process.env.STREAM_API_SECRET!)

const openAI = new OpenAI({
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: process.env.OPEN_ROUTER_API_KEY
});

// register user with stream chat
app.post('/register-user', async (req: Request, res: Response): Promise<any> => {
    const { name, email } = req.body;
    if(!name || !email) return res.status(400).json({error: 'Name and email are required.'})

    try {
        const userId = email.replace(/[^a-zA-Z0-9_-]/g, '_'); /// generates IDs by replacing special symbols with '_'
        
        // check if user exists in stream chatapp DB
        const userResponse = await chatClient.queryUsers({id: {$eq: userId}}); 
        if(!userResponse.users.length) {
            await chatClient.upsertUser({
                id: userId,
                name,
                email,
                role: 'user',
            } as any);
        }

        // check if user exits in Neon DB
        const existingUser = await db.select().from(users).where(eq(users.userId, userId))
        if(!existingUser.length) {
            console.log(`User ${userId} does not exists in DB. Adding them...`);
            await db.insert(users).values({userId, name, email})
        }

        res.status(200).json({userId, name, email});
    } catch(e) {
        res.status(500).json({error: 'Internal Server Error'})
    }
})

app.post('/chat', async (req: Request, res: Response): Promise<any> => {
    const { message, userId } = req.body;
    if(!message || !userId) {
        return res.status(400).json({
            error: 'Message and UserId is required'
        })
    }

    try {
        const usersResponse = await chatClient.queryUsers({id: {$eq: userId}});
        if(!usersResponse.users.length) return res.status(404).json({error: 'User not found. Please regiser first.'})
        
        const userExistsInNeonDB = await db.select().from(users).where(eq(users.userId, userId));
        if(!userExistsInNeonDB.length) {
            return res.status(400).json({error: 'You do not have an account. Please register to use Gossip.'});
        } 

        const chatHistory = await db
            .select()
            .from(chats)
            .where(eq(chats.userId, userId))
            .orderBy(chats.createdAt).
            limit(10);
        
        const conversation: ChatCompletionMessageParam[] = chatHistory.flatMap((chat) => [
            {role: 'user', content: chat.message},
            {role: 'assistant', content: chat.reply}
        ]);

        conversation.push({role: 'user', content: message});

        // Send message to Google Gemma model
        const modelResponse = await openAI.chat.completions.create({
            model: 'google/gemma-2-9b-it:free',
            messages: conversation as ChatCompletionMessageParam[]
        });

        const messageResponse = modelResponse.choices[0].message?.content ?? 'Unable to get response. Retry!'; 
        
        // save model reply to neon DB
        await db.insert(chats).values({userId, message, reply: messageResponse})

        const channel = chatClient.channel('messaging', `chat-${userId}`, {
            name: 'Gossip.',
            created_by_id: 'Gossip.'
        } as any)

        await channel.create();
        await channel.sendMessage({
            text: messageResponse,
            user_id: 'Gossip.'
        });

        res.status(200).json({reply: messageResponse})
    } catch(e) {
        return res.status(500).json({error: 'Internal Server Error'});
    }
})

app.post('/get-messages', async (req: Request, res: Response): Promise<any> => {
    const { userId } = req.body;
    if(!userId) {
        return res.status(400).json({error: 'UserID is required.'})
    }

    try {
        const chatHistory = await db.select().from(chats).where(eq(chats.userId, userId));
        res.status(200).json({messages: chatHistory})
    } catch(e) {
        res.status(500).json({error:'Unable to retrieve chat histroy. Please try again.'})
    }
})

app.listen(PORT, () => console.log(`Server running on :: ${PORT}`))