# MongoDB Connection Verification Guide

## Prerequisites

Before testing the connection, ensure MongoDB is running locally.

### Start MongoDB (macOS)

Choose one of the following methods:

**Option 1: Using Homebrew Services** (Recommended)
```bash
brew services start mongodb-community
```

**Option 2: Run manually**
```bash
mongod --config /usr/local/etc/mongod.conf
```

**Option 3: Run with default settings**
```bash
mongod --dbpath /usr/local/var/mongodb
```

### Verify MongoDB is Running

```bash
# Check if MongoDB process is running
ps aux | grep mongod

# Or check with Homebrew
brew services list | grep mongodb
```

---

## Verification Methods

### Method 1: Using the Test API Endpoint (Recommended)

1. **Ensure the dev server is running**:
   ```bash
   npm run dev
   ```

2. **Open your browser and navigate to**:
   ```
   http://localhost:5173/api/test-connection
   ```

3. **Expected successful response**:
   ```json
   {
     "success": true,
     "message": "MongoDB connection successful",
     "data": {
       "connected": true,
       "database": "merchant_contacts",
       "collections": ["customers"],
       "customersCollection": {
         "exists": true,
         "documentCount": 0
       }
     }
   }
   ```

4. **Check the server console** for connection logs:
   ```
   ✅ Successfully connected to MongoDB
   📦 Database: merchant_contacts
   🔗 URI: mongodb://localhost:27017
   ✨ Created collection: customers
   ```

### Method 2: Using curl

```bash
curl http://localhost:5173/api/test-connection | jq
```

### Method 3: Using MongoDB Compass

1. **Open MongoDB Compass**

2. **Connect to**: `mongodb://localhost:27017`

3. **Look for the database**: `merchant_contacts`

4. **Verify the collection**: `customers` should exist (created automatically by the test endpoint)

5. **Check collection details**:
   - Database: `merchant_contacts`
   - Collection: `customers`
   - Documents: 0 (no data inserted yet)

---

## Connection Details

### Database Configuration

- **Database Name**: `merchant_contacts`
- **Collection Name**: `customers`
- **Connection URI**: `mongodb://localhost:27017` (default)
- **Connection Pool**: 2-10 connections

### Environment Variables

The connection uses the following environment variable (optional):

```env
MONGODB_URI=mongodb://localhost:27017
```

If not set, it defaults to `mongodb://localhost:27017`.

---

## Troubleshooting

### Error: "Failed to connect to MongoDB"

**Possible causes**:
1. MongoDB is not running
2. Wrong connection URI
3. Port 27017 is blocked or in use

**Solutions**:

1. **Check if MongoDB is running**:
   ```bash
   brew services list | grep mongodb
   ```

2. **Start MongoDB**:
   ```bash
   brew services start mongodb-community
   ```

3. **Check MongoDB logs**:
   ```bash
   tail -f /usr/local/var/log/mongodb/mongo.log
   ```

4. **Verify port 27017 is available**:
   ```bash
   lsof -i :27017
   ```

### Error: "Connection timeout"

**Solution**: Increase the timeout in `db.server.ts`:
```typescript
serverSelectionTimeoutMS: 10000, // Increase to 10 seconds
```

### Error: "Authentication failed"

If you have authentication enabled on MongoDB:

1. **Update `.env` with credentials**:
   ```env
   MONGODB_URI=mongodb://username:password@localhost:27017
   ```

2. **Restart the dev server**

---

## Testing the Connection Programmatically

You can also test the connection in your own route handlers:

```typescript
import { getDatabase, Collections } from '~/lib/db/db.server';

export async function loader() {
  try {
    const db = await getDatabase();
    const customers = db.collection(Collections.CUSTOMERS);
    const count = await customers.countDocuments();
    
    return { success: true, count };
  } catch (error) {
    return { success: false, error: error.message };
  }
}
```

---

## Next Steps After Verification

Once the connection is verified:

1. ✅ MongoDB is connected
2. ✅ Database `merchant_contacts` exists
3. ✅ Collection `customers` is created
4. ⏭️ Ready to implement CRUD operations
5. ⏭️ Ready to add validation schemas
6. ⏭️ Ready to build API routes

---

## Connection Features

The `db.server.ts` module includes:

- ✅ **Singleton Pattern**: Reuses connection across requests
- ✅ **HMR Support**: Preserves connection during development hot reloads
- ✅ **Connection Pooling**: Optimized for production (2-10 connections)
- ✅ **Error Handling**: Graceful error messages
- ✅ **Logging**: Connection status and database info
- ✅ **Graceful Shutdown**: Closes connection on SIGINT/SIGTERM
- ✅ **Type Safety**: TypeScript types for collections
- ✅ **Helper Functions**: `getDatabase()`, `getClient()`, `getCollection()`

---

## Quick Reference

### Import the database helpers

```typescript
import { getDatabase, getCollection, Collections } from '~/lib/db/db.server';
```

### Get database instance

```typescript
const db = await getDatabase();
```

### Get typed collection

```typescript
const customers = await getCollection<Customer>(Collections.CUSTOMERS);
```

### Get client (for admin operations)

```typescript
const client = await getClient();
```

---

## Summary

✅ MongoDB connection module created  
✅ Test endpoint available at `/api/test-connection`  
✅ Auto-creates `customers` collection on first connection  
✅ Ready for CRUD operations  

**Test the connection now by visiting**: http://localhost:5173/api/test-connection
