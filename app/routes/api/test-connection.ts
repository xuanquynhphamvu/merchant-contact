import type { LoaderFunctionArgs } from 'react-router';
import { getDatabase, Collections } from '~/lib/db/db.server';

/**
 * Test MongoDB connection endpoint
 * GET /api/test-connection
 */
export async function loader({ request }: LoaderFunctionArgs) {
    try {
        // Get database instance (will connect if not already connected)
        const db = await getDatabase();

        // Test: Ping the database
        const pingResult = await db.admin().ping();

        // Test: List collections
        const collections = await db.listCollections().toArray();
        const collectionNames = collections.map((c) => c.name);

        // Test: Check if customers collection exists
        const hasCustomersCollection = collectionNames.includes(Collections.CUSTOMERS);

        // If customers collection doesn't exist, create it
        if (!hasCustomersCollection) {
            await db.createCollection(Collections.CUSTOMERS);
            console.log(`✨ Created collection: ${Collections.CUSTOMERS}`);
        }

        // Get collection stats
        const customersCollection = db.collection(Collections.CUSTOMERS);
        const documentCount = await customersCollection.countDocuments();

        return Response.json({
            success: true,
            message: 'MongoDB connection successful',
            data: {
                connected: pingResult.ok === 1,
                database: db.databaseName,
                collections: collectionNames,
                customersCollection: {
                    exists: true,
                    documentCount,
                },
            },
        });
    } catch (error) {
        console.error('MongoDB connection test failed:', error);

        return Response.json(
            {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error',
                message: 'Failed to connect to MongoDB',
            },
            { status: 500 }
        );
    }
}
