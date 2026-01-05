import type { Document, ObjectId } from 'mongodb';

/**
 * Customer Status Type
 * 
 * WHY TYPE ALIAS?
 * - Union types are best represented as type aliases
 * - Cannot be expressed with interfaces
 * - Provides literal type checking for status values
 */
export type CustomerStatus = 'active' | 'inactive';

/**
 * Customer Entity Interface
 * 
 * WHY INTERFACE?
 * - Represents the shape of data objects (entities)
 * - Can extend MongoDB's Document type for compatibility
 * - Better for object structures that may be extended later
 * - Provides better error messages in IDEs
 * - Can be augmented/merged if needed in the future
 * 
 * MONGODB INTEGRATION:
 * - Extends Document to satisfy MongoDB's type requirements
 * - _id is ObjectId (MongoDB's native ID type)
 * - All fields map directly to MongoDB document structure
 */
export interface Customer extends Document {
    /**
     * MongoDB ObjectId - automatically generated
     */
    _id: ObjectId;

    /**
     * Customer's full name
     * @example "John Doe"
     */
    name: string;

    /**
     * Customer's email address
     * @example "john@example.com"
     */
    email: string;

    /**
     * Optional phone number
     * @example "+1-555-0123"
     */
    phone?: string;

    /**
     * Optional company name
     * @example "Acme Corp"
     */
    company?: string;

    /**
     * Customer status - active or inactive
     */
    status: CustomerStatus;

    /**
     * Array of tags for categorization
     * @example ["vip", "enterprise", "priority"]
     */
    tags: string[];

    /**
     * Optional notes about the customer
     */
    notes?: string;

    /**
     * Timestamp when customer was created
     */
    createdAt: Date;

    /**
     * Timestamp when customer was last updated
     */
    updatedAt: Date;
}

/**
 * Customer Creation Input Type
 * 
 * WHY TYPE ALIAS?
 * - Derived/transformed type using utility types (Omit)
 * - Represents data transformation, not an entity
 * - Type aliases work better with utility types
 * 
 * USAGE IN ACTIONS:
 * - Used when creating new customers via POST requests
 * - Excludes auto-generated fields (_id, createdAt, updatedAt)
 * - Ensures clients don't try to set these fields manually
 */
export type CreateCustomerInput = Omit<Customer, '_id' | 'createdAt' | 'updatedAt'>;

/**
 * Customer Update Input Type
 * 
 * WHY TYPE ALIAS?
 * - Derived type using Partial utility type
 * - All fields are optional for flexible updates
 * 
 * USAGE IN ACTIONS:
 * - Used for PATCH/PUT requests to update customers
 * - Allows partial updates (only send changed fields)
 */
export type UpdateCustomerInput = Partial<CreateCustomerInput>;

/**
 * Customer Filter Options Interface
 * 
 * WHY INTERFACE?
 * - Represents a configuration object
 * - May be extended with more filter options later
 * 
 * USAGE IN LOADERS:
 * - Used to filter customer lists in GET requests
 * - Passed as query parameters or request body
 */
export interface CustomerFilters {
    /**
     * Filter by customer status
     */
    status?: CustomerStatus;

    /**
     * Filter by tags (customers must have ALL specified tags)
     */
    tags?: string[];

    /**
     * Search term for name, email, or company
     */
    search?: string;
}

/**
 * Pagination Options Interface
 * 
 * WHY INTERFACE?
 * - Standard configuration object
 * - May be extended with sorting options later
 * 
 * USAGE IN LOADERS:
 * - Controls pagination in list endpoints
 * - Typically from URL search params
 */
export interface PaginationOptions {
    /**
     * Current page number (1-indexed)
     */
    page: number;

    /**
     * Number of items per page
     */
    limit: number;
}

/**
 * Paginated Response Interface
 * 
 * WHY INTERFACE?
 * - Generic interface for any paginated data
 * - Consistent response structure across all list endpoints
 * 
 * USAGE IN LOADERS:
 * - Return type for paginated list endpoints
 * - Provides metadata for client-side pagination UI
 * 
 * @template T - The type of items in the data array
 */
export interface PaginatedResponse<T> {
    /**
     * Array of items for current page
     */
    data: T[];

    /**
     * Total number of items across all pages
     */
    total: number;

    /**
     * Current page number
     */
    page: number;

    /**
     * Items per page
     */
    limit: number;

    /**
     * Total number of pages
     */
    totalPages: number;
}

/**
 * Serialized Customer Type
 * 
 * WHY TYPE ALIAS?
 * - Represents transformed data for JSON serialization
 * - ObjectId and Date need to be converted to strings for JSON
 * 
 * USAGE IN LOADERS:
 * - Return type for loaders (React Router serializes to JSON)
 * - Ensures type safety when sending data to client
 */
export type SerializedCustomer = Omit<Customer, '_id' | 'createdAt' | 'updatedAt'> & {
    _id: string;
    createdAt: string;
    updatedAt: string;
};

/**
 * Customer Sort Field Type
 * 
 * WHY TYPE ALIAS?
 * - Literal type for sortable fields
 * - Can be extended with more fields later (e.g., 'name', 'email')
 * 
 * USAGE IN LOADERS:
 * - Validates sort field from URL query params
 */
export type CustomerSortField = 'createdAt';

/**
 * Customer Sort Order Type
 * 
 * WHY TYPE ALIAS?
 * - Standard ascending/descending sort directions
 * - Maps to MongoDB sort values (1 for asc, -1 for desc)
 * 
 * USAGE IN LOADERS:
 * - Validates sort order from URL query params
 */
export type CustomerSortOrder = 'asc' | 'desc';

/**
 * Customer Query Parameters Interface
 * 
 * WHY INTERFACE?
 * - Represents URL query parameter structure
 * - All fields are optional (query params may not be present)
 * - Can be extended with more filter options later
 * 
 * USAGE IN LOADERS:
 * - Type for parsed URL search params
 * - Ensures type safety when building MongoDB queries
 * 
 * URL EXAMPLES:
 * - ?search=john
 * - ?status=active
 * - ?tags=vip,enterprise
 * - ?sortField=createdAt&sortOrder=desc
 * - ?search=john&status=active&sortField=createdAt&sortOrder=desc
 */
export interface CustomerQueryParams {
    /**
     * Search term for name and email (case-insensitive)
     * @example "john" matches "John Doe" and "john@example.com"
     */
    search?: string;

    /**
     * Filter by customer status
     */
    status?: CustomerStatus;

    /**
     * Comma-separated tags to filter by
     * Customers must have at least one of the specified tags
     * @example "vip,enterprise"
     */
    tags?: string;

    /**
     * Field to sort by
     */
    sortField?: CustomerSortField;

    /**
     * Sort order (ascending or descending)
     */
    sortOrder?: CustomerSortOrder;
}
