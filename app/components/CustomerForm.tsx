import { Form } from "react-router";
import type { SerializedCustomer } from "~/types/customer";

/**
 * CustomerForm Component
 * 
 * Reusable form component for creating and editing customers
 * Uses React Router Form for progressive enhancement
 */
interface CustomerFormProps {
    /**
     * Validation errors from action
     */
    errors?: Record<string, string>;

    /**
     * Default values for pre-filling form (used in edit mode)
     */
    defaultValues?: Partial<SerializedCustomer>;

    /**
     * Label for submit button
     */
    submitLabel: string;
}

export function CustomerForm({ errors, defaultValues, submitLabel }: CustomerFormProps) {
    // Convert tags array to comma-separated string for input field
    const defaultTags = defaultValues?.tags?.join(", ") || "";

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
                    defaultValue={defaultValues?.name || ""}
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
                    defaultValue={defaultValues?.email || ""}
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
                    defaultValue={defaultValues?.phone || ""}
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
                    defaultValue={defaultValues?.company || ""}
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
                    defaultValue={defaultValues?.status || "active"}
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
                    defaultValue={defaultTags}
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
                    defaultValue={defaultValues?.notes || ""}
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
                    {submitLabel}
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
