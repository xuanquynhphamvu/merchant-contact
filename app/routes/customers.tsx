import type { Route } from "./+types/customers";
import { useLoaderData } from "react-router";
import { getCollection, Collections } from "~/lib/db/db.server";
import type { Customer, SerializedCustomer } from "~/types/customer";

/**
 * Loader function - fetches customers from MongoDB
 * 
 * EXECUTION CONTEXT:
 * - Runs on SERVER during initial page load (SSR)
 * - Runs on CLIENT during client-side navigation
 * 
 * TYPE SAFETY:
 * - Returns SerializedCustomer[] (ObjectId and Date converted to strings)
 * - React Router automatically serializes to JSON
 */
export async function loader({ request }: Route.LoaderArgs): Promise<SerializedCustomer[]> {
    try {
        // Get typed MongoDB collection
        const collection = await getCollection<Customer>(Collections.CUSTOMERS);

        // Fetch all customers from MongoDB
        const customers = await collection.find().toArray();

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
 * Renders a basic list of customers with conditional empty state
 */
export default function Customers() {
    // Get typed loader data
    const customers = useLoaderData<typeof loader>();

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
                    <a
                        href="/customers/new"
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
                    >
                        + New Customer
                    </a>
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
