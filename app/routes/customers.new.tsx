import type { Route } from "./+types/customers.new";
import { Form, redirect, useActionData } from "react-router";
import { getCollection, Collections } from "~/lib/db/db.server";
import type { Customer, CreateCustomerInput, CustomerStatus } from "~/types/customer";

/**
 * Action function - handles form submission
 * 
 * FLOW:
 * 1. Extract form data from request
 * 2. Validate required fields
 * 3. Insert into MongoDB
 * 4. Redirect to customers list
 * 
 * TYPE SAFETY:
 * - Uses Route.ActionArgs for typed request
 * - Returns validation errors or redirect response
 */
export async function action({ request }: Route.ActionArgs) {
    // Extract form data from POST request
    const formData = await request.formData();

    // Get form field values using destructuring
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const phone = formData.get("phone") as string;
    const company = formData.get("company") as string;
    const status = formData.get("status") as CustomerStatus;
    const tags = formData.get("tags") as string;
    const notes = formData.get("notes") as string;

    // Validate required fields
    const errors: Record<string, string> = {};

    if (!name || name.trim() === "") {
        errors.name = "Name is required";
    }

    if (!email || email.trim() === "") {
        errors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        errors.email = "Invalid email format";
    }

    if (!status) {
        errors.status = "Status is required";
    }

    // Return errors if validation fails
    if (Object.keys(errors).length > 0) {
        return { errors };
    }

    try {
        // Get typed MongoDB collection
        const collection = await getCollection<Customer>(Collections.CUSTOMERS);

        // Parse tags from comma-separated string
        const tagArray = tags
            ? tags.split(",").map(tag => tag.trim()).filter(tag => tag.length > 0)
            : [];

        // Create customer input object using object destructuring and spread
        const customerInput: CreateCustomerInput = {
            name: name.trim(),
            email: email.trim(),
            status,
            tags: tagArray,
            // Spread operator for optional fields
            ...(phone && { phone: phone.trim() }),
            ...(company && { company: company.trim() }),
            ...(notes && { notes: notes.trim() }),
        };

        // Create customer document with timestamps
        const now = new Date();
        const customerDocument = {
            ...customerInput,
            createdAt: now,
            updatedAt: now,
        };

        // Insert into MongoDB
        await collection.insertOne(customerDocument as any);

        // Redirect to customers list after success
        return redirect("/customers");
    } catch (error) {
        console.error("Failed to create customer:", error);
        return {
            errors: {
                _form: "Failed to create customer. Please try again.",
            },
        };
    }
}

/**
 * CustomerForm Component
 * 
 * Reusable form component for creating customers
 * Uses React Router Form for progressive enhancement
 */
interface CustomerFormProps {
    errors?: Record<string, string>;
}

function CustomerForm({ errors }: CustomerFormProps) {
    return (
        <Form method="post" className="space-y-6">
            {/* Form-level error */}
            {errors?._form && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                    <p className="text-red-800 dark:text-red-200 text-sm">{errors._form}</p>
                </div>
            )}

            {/* Name field (required) */}
            <div>
                <label htmlFor="name" className="block text-sm font-medium text-slate-900 dark:text-slate-50 mb-2">
                    Name <span className="text-red-500">*</span>
                </label>
                <input
                    type="text"
                    id="name"
                    name="name"
                    required
                    className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="John Doe"
                />
                {errors?.name && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.name}</p>
                )}
            </div>

            {/* Email field (required) */}
            <div>
                <label htmlFor="email" className="block text-sm font-medium text-slate-900 dark:text-slate-50 mb-2">
                    Email <span className="text-red-500">*</span>
                </label>
                <input
                    type="email"
                    id="email"
                    name="email"
                    required
                    className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="john@example.com"
                />
                {errors?.email && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.email}</p>
                )}
            </div>

            {/* Phone field (optional) */}
            <div>
                <label htmlFor="phone" className="block text-sm font-medium text-slate-900 dark:text-slate-50 mb-2">
                    Phone
                </label>
                <input
                    type="tel"
                    id="phone"
                    name="phone"
                    className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="+1-555-0123"
                />
            </div>

            {/* Company field (optional) */}
            <div>
                <label htmlFor="company" className="block text-sm font-medium text-slate-900 dark:text-slate-50 mb-2">
                    Company
                </label>
                <input
                    type="text"
                    id="company"
                    name="company"
                    className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Acme Corp"
                />
            </div>

            {/* Status field (required) */}
            <div>
                <label htmlFor="status" className="block text-sm font-medium text-slate-900 dark:text-slate-50 mb-2">
                    Status <span className="text-red-500">*</span>
                </label>
                <select
                    id="status"
                    name="status"
                    required
                    defaultValue="active"
                    className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                </select>
                {errors?.status && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.status}</p>
                )}
            </div>

            {/* Tags field (optional) */}
            <div>
                <label htmlFor="tags" className="block text-sm font-medium text-slate-900 dark:text-slate-50 mb-2">
                    Tags
                </label>
                <input
                    type="text"
                    id="tags"
                    name="tags"
                    className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="vip, enterprise, priority (comma-separated)"
                />
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                    Separate multiple tags with commas
                </p>
            </div>

            {/* Notes field (optional) */}
            <div>
                <label htmlFor="notes" className="block text-sm font-medium text-slate-900 dark:text-slate-50 mb-2">
                    Notes
                </label>
                <textarea
                    id="notes"
                    name="notes"
                    rows={4}
                    className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Additional notes about this customer..."
                />
            </div>

            {/* Submit button */}
            <div className="flex gap-4">
                <button
                    type="submit"
                    className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                    Create Customer
                </button>
                <a
                    href="/customers"
                    className="px-6 py-2 bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-900 dark:text-slate-50 font-medium rounded-lg transition-colors"
                >
                    Cancel
                </a>
            </div>
        </Form>
    );
}

/**
 * New Customer Page Component
 */
export default function NewCustomer() {
    // Get action data (validation errors if any)
    const actionData = useActionData<typeof action>();

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
            <div className="container mx-auto px-4 py-8 max-w-2xl">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50">
                        Create New Customer
                    </h1>
                    <p className="text-slate-600 dark:text-slate-400 mt-2">
                        Add a new customer to your contact list
                    </p>
                </div>

                {/* Form */}
                <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
                    <CustomerForm errors={actionData?.errors} />
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
        { title: "New Customer | Merchant Contact Manager" },
        { name: "description", content: "Create a new customer contact" },
    ];
}
