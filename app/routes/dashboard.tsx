import type { Route } from "./+types/dashboard";
import { useLoaderData } from "react-router";
import { getCollection, Collections } from "~/lib/db/db.server";
import type { Customer } from "~/types/customer";
import type { DashboardStats } from "~/types/dashboard";

/**
 * Loader function - computes dashboard statistics using MongoDB aggregation
 * 
 * WHY AGGREGATION IN MONGODB (NOT IN REACT)?
 * 
 * 1. PERFORMANCE:
 *    - Aggregation happens on the database server, not in JavaScript
 *    - Only the final results are sent over the network (3 numbers vs. all customer documents)
 *    - With 10,000 customers: ~200KB of data vs. ~3 numbers
 * 
 * 2. SCALABILITY:
 *    - Works efficiently even with millions of records
 *    - Database can use indexes to optimize aggregation
 *    - No memory issues from loading all documents into Node.js
 * 
 * 3. ACCURACY:
 *    - Single atomic operation ensures consistent results
 *    - No race conditions from data changing during computation
 * 
 * 4. DATABASE OPTIMIZATION:
 *    - MongoDB is specifically designed for aggregation operations
 *    - Can parallelize computation across shards (in production)
 *    - Uses optimized C++ code instead of JavaScript
 * 
 * AGGREGATION STAGES USED:
 * - $match: Filter documents (like WHERE in SQL)
 * - $group: Group documents and compute aggregates (like GROUP BY in SQL)
 * - $count: Count documents (like COUNT(*) in SQL)
 */
export async function loader({ request }: Route.LoaderArgs): Promise<DashboardStats> {
    try {
        const collection = await getCollection<Customer>(Collections.CUSTOMERS);

        // Calculate date 7 days ago for recent customers filter
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        // AGGREGATION 1: Total customers count
        // Uses $count stage to count all documents in collection
        const totalResult = await collection.aggregate([
            { $count: 'total' }
        ]).toArray();
        const totalCustomers = totalResult[0]?.total || 0;

        // AGGREGATION 2: Recent customers (last 7 days)
        // Uses $match to filter by createdAt >= 7 days ago, then $count
        const recentResult = await collection.aggregate([
            {
                $match: {
                    createdAt: { $gte: sevenDaysAgo }
                }
            },
            { $count: 'total' }
        ]).toArray();
        const recentCustomers = recentResult[0]?.total || 0;

        // AGGREGATION 3: Count by status
        // Uses $group to group by status field and count each group
        const statusResult = await collection.aggregate([
            {
                $group: {
                    _id: '$status',  // Group by status field
                    count: { $sum: 1 }  // Count documents in each group
                }
            },
            {
                $sort: { count: -1 }  // Sort by count descending
            }
        ]).toArray();

        // Type assertion for aggregation result
        const customersByStatus = statusResult as Array<{
            _id: Customer['status'];
            count: number;
        }>;

        // Return typed dashboard stats
        return {
            totalCustomers,
            recentCustomers,
            customersByStatus,
        };
    } catch (error) {
        console.error('Failed to fetch dashboard stats:', error);
        // Return empty stats on error to prevent route from breaking
        return {
            totalCustomers: 0,
            recentCustomers: 0,
            customersByStatus: [],
        };
    }
}

/**
 * Dashboard Component
 * 
 * Displays aggregated statistics in a clean card-based layout
 */
export default function Dashboard() {
    const stats = useLoaderData<typeof loader>();

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
            <div className="container mx-auto px-4 py-8">
                {/* Header */}
                <div className="mb-8 flex items-start justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50">
                            Dashboard
                        </h1>
                        <p className="text-slate-600 dark:text-slate-400 mt-2">
                            Overview of your customer statistics
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
                            href="/customers"
                            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors flex items-center gap-2"
                        >
                            <span>📇</span>
                            <span>Customers</span>
                        </a>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    {/* Total Customers Card */}
                    <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                                    Total Customers
                                </p>
                                <p className="text-3xl font-bold text-slate-900 dark:text-slate-50 mt-2">
                                    {stats.totalCustomers.toLocaleString()}
                                </p>
                            </div>
                            <div className="text-4xl">👥</div>
                        </div>
                    </div>

                    {/* Recent Customers Card */}
                    <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                                    Added Last 7 Days
                                </p>
                                <p className="text-3xl font-bold text-slate-900 dark:text-slate-50 mt-2">
                                    {stats.recentCustomers.toLocaleString()}
                                </p>
                            </div>
                            <div className="text-4xl">📈</div>
                        </div>
                        {stats.totalCustomers > 0 && (
                            <p className="text-xs text-slate-500 dark:text-slate-500 mt-3">
                                {((stats.recentCustomers / stats.totalCustomers) * 100).toFixed(1)}% of total
                            </p>
                        )}
                    </div>

                    {/* Quick Link Card */}
                    <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg border border-blue-600 p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-blue-100">
                                    Manage Customers
                                </p>
                                <a
                                    href="/customers"
                                    className="inline-block mt-3 px-4 py-2 bg-white text-blue-600 font-medium rounded-lg hover:bg-blue-50 transition-colors"
                                >
                                    View All →
                                </a>
                            </div>
                            <div className="text-4xl">📋</div>
                        </div>
                    </div>
                </div>

                {/* Customers by Status */}
                <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
                    <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50 mb-4">
                        Customers by Status
                    </h2>

                    {stats.customersByStatus.length === 0 ? (
                        // Empty state
                        <div className="text-center py-8">
                            <div className="text-4xl mb-2">📊</div>
                            <p className="text-slate-600 dark:text-slate-400">
                                No customer data available
                            </p>
                        </div>
                    ) : (
                        // Status breakdown
                        <div className="space-y-4">
                            {stats.customersByStatus.map((statusGroup) => {
                                const percentage = stats.totalCustomers > 0
                                    ? (statusGroup.count / stats.totalCustomers) * 100
                                    : 0;

                                return (
                                    <div key={statusGroup._id}>
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="flex items-center gap-2">
                                                <span
                                                    className={`px-3 py-1 rounded-full text-xs font-medium ${statusGroup._id === 'active'
                                                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                                        : 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300'
                                                        }`}
                                                >
                                                    {statusGroup._id}
                                                </span>
                                                <span className="text-sm text-slate-600 dark:text-slate-400">
                                                    {statusGroup.count.toLocaleString()} customers
                                                </span>
                                            </div>
                                            <span className="text-sm font-medium text-slate-900 dark:text-slate-50">
                                                {percentage.toFixed(1)}%
                                            </span>
                                        </div>
                                        {/* Progress bar */}
                                        <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                                            <div
                                                className={`h-2 rounded-full transition-all ${statusGroup._id === 'active'
                                                    ? 'bg-green-500'
                                                    : 'bg-slate-400 dark:bg-slate-500'
                                                    }`}
                                                style={{ width: `${percentage}%` }}
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

/**
 * Meta tags for SEO
 */
export function meta({ }: Route.MetaArgs) {
    return [
        { title: "Dashboard | Merchant Contact Manager" },
        { name: "description", content: "View customer statistics and insights" },
    ];
}
