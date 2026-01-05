import type { CustomerStatus } from './customer';

/**
 * Dashboard Statistics Interface
 * 
 * WHY INTERFACE?
 * - Represents the shape of aggregated data from MongoDB
 * - Can be extended with more stats in the future
 * - Better for object structures
 * 
 * USAGE IN LOADERS:
 * - Return type for dashboard loader
 * - Computed using MongoDB aggregation pipelines
 */
export interface DashboardStats {
    /**
     * Total number of customers in the database
     * Computed using MongoDB $count aggregation stage
     */
    totalCustomers: number;

    /**
     * Number of customers added in the last 7 days
     * Computed using $match (filter by createdAt) + $count
     */
    recentCustomers: number;

    /**
     * Count of customers grouped by status
     * Computed using $group aggregation stage
     * 
     * @example
     * [
     *   { _id: 'active', count: 42 },
     *   { _id: 'inactive', count: 8 }
     * ]
     */
    customersByStatus: Array<{
        _id: CustomerStatus;
        count: number;
    }>;
}
