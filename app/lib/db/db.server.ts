import { MongoClient, Db, Collection } from 'mongodb';
import type { Document } from 'mongodb';
import type { Customer } from '~/types/customer';

/**
 * MongoDB Connection URI
 * Defaults to local MongoDB instance if not specified in environment
 */
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017';

/**
 * Database name
 */
const DB_NAME = 'merchant_contacts';

/**
 * Global MongoDB client instance
 * Using global to prevent multiple connections in development (HMR)
 */
declare global {
    // eslint-disable-next-line no-var
    var __mongoClient: MongoClient | undefined;
}

let client: MongoClient;
let db: Db;

/**
 * Initialize MongoDB connection
 * Uses singleton pattern to reuse connection across requests
 */
async function connectToDatabase(): Promise<{ client: MongoClient; db: Db }> {
    // Reuse existing connection in development (HMR support)
    if (global.__mongoClient) {
        client = global.__mongoClient;
        db = client.db(DB_NAME);
        return { client, db };
    }

    try {
        // Create new MongoClient instance
        client = new MongoClient(MONGODB_URI, {
            // Connection pool settings for production
            maxPoolSize: 10,
            minPoolSize: 2,
            serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
        });

        // Connect to MongoDB
        await client.connect();

        // Verify connection
        await client.db('admin').command({ ping: 1 });

        console.log('✅ Successfully connected to MongoDB');
        console.log(`📦 Database: ${DB_NAME}`);
        console.log(`🔗 URI: ${MONGODB_URI.replace(/\/\/.*@/, '//***@')}`); // Hide credentials in logs

        db = client.db(DB_NAME);

        // Store client globally in development for HMR
        if (process.env.NODE_ENV === 'development') {
            global.__mongoClient = client;
        }

        return { client, db };
    } catch (error) {
        console.error('❌ Failed to connect to MongoDB:', error);
        throw new Error(
            `MongoDB connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`
        );
    }
}

/**
 * Get database instance
 * Automatically connects if not already connected
 */
export async function getDatabase(): Promise<Db> {
    if (!db) {
        const connection = await connectToDatabase();
        db = connection.db;
    }
    return db;
}

/**
 * Get MongoDB client instance
 */
export async function getClient(): Promise<MongoClient> {
    if (!client) {
        const connection = await connectToDatabase();
        client = connection.client;
    }
    return client;
}

/**
 * Get typed collection helper
 * Provides type-safe access to MongoDB collections
 */
export async function getCollection<T extends Document = Customer>(
    collectionName: string
): Promise<Collection<T>> {
    const database = await getDatabase();
    return database.collection<T>(collectionName);
}

/**
 * Collection names enum for type safety
 */
export const Collections = {
    CUSTOMERS: 'customers',
} as const;

/**
 * Close MongoDB connection
 * Should be called when shutting down the application
 */
export async function closeDatabase(): Promise<void> {
    if (client) {
        await client.close();
        console.log('🔌 MongoDB connection closed');
    }
}

// Handle graceful shutdown
if (typeof process !== 'undefined') {
    process.on('SIGINT', async () => {
        await closeDatabase();
        process.exit(0);
    });

    process.on('SIGTERM', async () => {
        await closeDatabase();
        process.exit(0);
    });
}
