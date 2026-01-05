/**
 * Customer entity type
 */
export interface Customer {
  _id: string; // MongoDB ObjectId as string
  name: string;
  email: string;
  phone?: string;
  company?: string;
  status: CustomerStatus;
  tags: string[];
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Customer status enum
 */
export type CustomerStatus = 'active' | 'inactive';

/**
 * Customer creation input (without generated fields)
 */
export type CreateCustomerInput = Omit<Customer, '_id' | 'createdAt' | 'updatedAt'>;

/**
 * Customer update input (partial fields)
 */
export type UpdateCustomerInput = Partial<CreateCustomerInput>;

/**
 * Customer filter options
 */
export interface CustomerFilters {
  status?: CustomerStatus;
  tags?: string[];
  search?: string; // Search in name, email, company
}

/**
 * Pagination options
 */
export interface PaginationOptions {
  page: number;
  limit: number;
}

/**
 * Paginated response
 */
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
