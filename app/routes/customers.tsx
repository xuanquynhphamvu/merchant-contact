import type { Route } from "./+types/customers";
import { useLoaderData } from "react-router";
import { getCollection, Collections } from "~/lib/db/db.server";
import type { Customer, SerializedCustomer, CustomerQueryParams } from "~/types/customer";

/**
 * Loader function - fetches customers from MongoDB with search, filter, and sort
 * 
 * EXECUTION CONTEXT:
 * - Runs on SERVER during initial page load (SSR)
 * - Runs on CLIENT during client-side navigation
 * 
 * QUERY PARAM FLOW:
 * 1. Parse URL search params from request.url
 * 2. Extract and validate: search, status, tags, sortField, sortOrder
 * 3. Build MongoDB filter object using operators ($regex, $in)
 * 4. Build MongoDB sort object (1 for asc, -1 for desc)
 * 5. Execute query: collection.find(filter).sort(sort).toArray()
 * 6. Serialize and return results
 * 
 * TYPE SAFETY:
 * - Returns SerializedCustomer[] (ObjectId and Date converted to strings)
 * - React Router automatically serializes to JSON
 */
export async function loader({ request }: Route.LoaderArgs): Promise<SerializedCustomer[]> {
    try {
        // Parse URL search params
        const url = new URL(request.url);
        const searchParams = url.searchParams;

        // Extract query parameters
        const search = searchParams.get('search') || undefined;
        const status = searchParams.get('status') as CustomerQueryParams['status'];
        const tagsParam = searchParams.get('tags');
        const sortField = searchParams.get('sortField') as CustomerQueryParams['sortField'];
        const sortOrder = (searchParams.get('sortOrder') || 'desc') as CustomerQueryParams['sortOrder'];

        // Parse tags (comma-separated string to array)
        const tags = tagsParam ? tagsParam.split(',').map(tag => tag.trim()).filter(Boolean) : undefined;

        // Build MongoDB filter object
        const filter: any = {};

        // Search: $or with $regex for name and email (case-insensitive)
        if (search) {
            filter.$or = [
                { name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } }
            ];
        }

        // Status: exact match filter
        if (status && (status === 'active' || status === 'inactive')) {
            filter.status = status;
        }

        // Tags: $in operator (match customers with any of the specified tags)
        if (tags && tags.length > 0) {
            filter.tags = { $in: tags };
        }

        // Build MongoDB sort object
        const sort: any = {};
        if (sortField === 'createdAt') {
            sort[sortField] = sortOrder === 'asc' ? 1 : -1;
        } else {
            // Default sort: newest first
            sort.createdAt = -1;
        }

        // Get typed MongoDB collection
        const collection = await getCollection<Customer>(Collections.CUSTOMERS);

        // Execute query with filter and sort
        const customers = await collection.find(filter).sort(sort).toArray();

        // Serialize MongoDB documents for JSON response
        // Convert ObjectId and Date objects to strings
        const serializedCustomers: SerializedCustomer[] = customers.map((customer) => ({
            ...customer,
            _id: customer._id.toString(),
            createdAt: customer.createdAt.toISOString(),
            updatedAt: customer.updatedAt.toISOString(),
        }));

        return serializedCustomers;
    } catch (error) {
        console.error('Failed to fetch customers:', error);
        // Return empty array on error to prevent route from breaking
        return [];
    }
}

/**
 * Customer List Component
 * 
 * Renders customer list with search, filter, and sort controls
 * All filters use URL query params as single source of truth
 */
export default function Customers() {
    // Get typed loader data
    const customers = useLoaderData<typeof loader>();

    // Parse current URL search params for controlled inputs
    const url = typeof window !== 'undefined' ? new URL(window.location.href) : new URL('http://localhost');
    const searchParams = url.searchParams;
    const currentSearch = searchParams.get('search') || '';
    const currentStatus = searchParams.get('status') || '';
    const currentTags = searchParams.get('tags') || '';
    const currentSortField = searchParams.get('sortField') || 'createdAt';
    const currentSortOrder = searchParams.get('sortOrder') || 'desc';

    // Helper to build URL with updated params
    const buildUrl = (updates: Record<string, string | null>) => {
        const newParams = new URLSearchParams(searchParams);
        Object.entries(updates).forEach(([key, value]) => {
            if (value === null || value === '') {
                newParams.delete(key);
            } else {
                newParams.set(key, value);
            }
        });
        const paramString = newParams.toString();
        return `/customers${paramString ? `?${paramString}` : ''}`;
    };

    // Check if any filters are active
    const hasActiveFilters = currentSearch || currentStatus || currentTags ||
        (currentSortField !== 'createdAt' || currentSortOrder !== 'desc');

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
            <div className="container mx-auto px-4 py-8">
                {/* Header */}
                <div className="mb-8 flex items-start justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50">
                            Customers
                        </h1>
                        <p className="text-slate-600 dark:text-slate-400 mt-2">
                            Manage your customer contacts
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <a
                            href="/"
                            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 font-medium rounded-lg transition-colors flex items-center gap-2"
                        >
                            <span>🏠</span>
                            <span>Home</span>
                        </a>
                        <a
                            href="/dashboard"
                            className="px-4 py-2 bg-slate-600 hover:bg-slate-700 text-white font-medium rounded-lg transition-colors flex items-center gap-2"
                        >
                            <span>📊</span>
                            <span>Dashboard</span>
                        </a>
                        <a
                            href="/customers/new"
                            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
                        >
                            + New Customer
                        </a>
                    </div>
                </div>

                {/* Search, Filter, and Sort Controls */}
                <div className="mb-6 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4">
                    {/* Search Bar */}
                    <form method="get" action="/customers" className="mb-4">
                        <div className="flex gap-2">
                            <input
                                type="text"
                                name="search"
                                placeholder="Search by name or email..."
                                defaultValue={currentSearch}
                                className="flex-1 px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-50 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            {/* Preserve other params */}
                            {currentStatus && <input type="hidden" name="status" value={currentStatus} />}
                            {currentTags && <input type="hidden" name="tags" value={currentTags} />}
                            {currentSortField && <input type="hidden" name="sortField" value={currentSortField} />}
                            {currentSortOrder && <input type="hidden" name="sortOrder" value={currentSortOrder} />}
                            <button
                                type="submit"
                                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
                            >
                                Search
                            </button>
                        </div>
                    </form>

                    {/* Filters and Sort */}
                    <div className="flex flex-wrap gap-3">
                        {/* Status Filter */}
                        <div className="flex items-center gap-2">
                            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                Status:
                            </label>
                            <select
                                value={currentStatus}
                                onChange={(e) => window.location.href = buildUrl({ status: e.target.value })}
                                className="px-3 py-1.5 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="">All</option>
                                <option value="active">Active</option>
                                <option value="inactive">Inactive</option>
                            </select>
                        </div>

                        {/* Tag Filter */}
                        <form
                            method="get"
                            action="/customers"
                            className="flex items-center gap-2"
                            onSubmit={(e) => {
                                e.preventDefault();
                                const formData = new FormData(e.currentTarget);
                                const tags = formData.get('tags') as string;
                                window.location.href = buildUrl({ tags: tags || null });
                            }}
                        >
                            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                Tags:
                            </label>
                            <input
                                type="text"
                                name="tags"
                                placeholder="e.g., vip,enterprise"
                                defaultValue={currentTags}
                                onBlur={(e) => {
                                    // Auto-submit when user clicks away
                                    const value = e.target.value.trim();
                                    if (value !== currentTags) {
                                        window.location.href = buildUrl({ tags: value || null });
                                    }
                                }}
                                className="px-3 py-1.5 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-50 text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 w-48"
                            />
                            <button
                                type="submit"
                                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
                            >
                                Apply
                            </button>
                            {/* Preserve other params */}
                            {currentSearch && <input type="hidden" name="search" value={currentSearch} />}
                            {currentStatus && <input type="hidden" name="status" value={currentStatus} />}
                            {currentSortField && <input type="hidden" name="sortField" value={currentSortField} />}
                            {currentSortOrder && <input type="hidden" name="sortOrder" value={currentSortOrder} />}
                        </form>

                        {/* Sort Controls */}
                        <div className="flex items-center gap-2">
                            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                Sort:
                            </label>
                            <a
                                href={buildUrl({ sortField: 'createdAt', sortOrder: 'desc' })}
                                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${currentSortOrder === 'desc'
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                                    }`}
                            >
                                Newest First
                            </a>
                            <a
                                href={buildUrl({ sortField: 'createdAt', sortOrder: 'asc' })}
                                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${currentSortOrder === 'asc'
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                                    }`}
                            >
                                Oldest First
                            </a>
                        </div>
                    </div>

                    {/* Active Filters Display */}
                    {hasActiveFilters && (
                        <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                            <div className="flex flex-wrap items-center gap-2">
                                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                    Active filters:
                                </span>
                                {currentSearch && (
                                    <a
                                        href={buildUrl({ search: null })}
                                        className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-sm rounded hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors"
                                    >
                                        Search: {currentSearch}
                                        <span className="font-bold">×</span>
                                    </a>
                                )}
                                {currentStatus && (
                                    <a
                                        href={buildUrl({ status: null })}
                                        className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-sm rounded hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors"
                                    >
                                        Status: {currentStatus}
                                        <span className="font-bold">×</span>
                                    </a>
                                )}
                                {currentTags && (
                                    <a
                                        href={buildUrl({ tags: null })}
                                        className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-sm rounded hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors"
                                    >
                                        Tags: {currentTags}
                                        <span className="font-bold">×</span>
                                    </a>
                                )}
                                <a
                                    href="/customers"
                                    className="ml-2 text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-50 underline"
                                >
                                    Clear all
                                </a>
                            </div>
                        </div>
                    )}
                </div>

                {/* Conditional rendering: Empty state vs Customer list */}
                {customers.length === 0 ? (
                    // Empty State
                    <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-12 text-center">
                        <div className="text-6xl mb-4">📭</div>
                        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50 mb-2">
                            No customers yet
                        </h2>
                        <p className="text-slate-600 dark:text-slate-400">
                            Get started by adding your first customer
                        </p>
                    </div>
                ) : (
                    // Customer List
                    <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
                        <div className="divide-y divide-slate-200 dark:divide-slate-700">
                            {customers.map((customer) => (
                                <div
                                    key={customer._id}
                                    className="p-6 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            {/* Customer Name */}
                                            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50">
                                                {customer.name}
                                            </h3>

                                            {/* Customer Email */}
                                            <p className="text-slate-600 dark:text-slate-400 mt-1">
                                                {customer.email}
                                            </p>

                                            {/* Company (if exists) */}
                                            {customer.company && (
                                                <p className="text-sm text-slate-500 dark:text-slate-500 mt-1">
                                                    {customer.company}
                                                </p>
                                            )}

                                            {/* Tags */}
                                            {customer.tags.length > 0 && (
                                                <div className="flex gap-2 mt-3">
                                                    {customer.tags.map((tag: string) => (
                                                        <span
                                                            key={tag}
                                                            className="px-2 py-1 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs rounded"
                                                        >
                                                            {tag}
                                                        </span>
                                                    ))}
                                                </div>
                                            )}
                                        </div>

                                        {/* Status Badge and Edit Button */}
                                        <div className="flex flex-col items-end gap-2">
                                            <span
                                                className={`px-3 py-1 rounded-full text-xs font-medium ${customer.status === 'active'
                                                    ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                                    : 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300'
                                                    }`}
                                            >
                                                {customer.status}
                                            </span>
                                            <a
                                                href={`/customers/${customer._id}`}
                                                className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded transition-colors"
                                            >
                                                Edit
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

/**
 * Meta tags for SEO
 */
export function meta({ }: Route.MetaArgs) {
    return [
        { title: "Customers | Merchant Contact Manager" },
        { name: "description", content: "View and manage your customer contacts" },
    ];
}
