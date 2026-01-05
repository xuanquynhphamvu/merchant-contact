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

import { CustomerForm } from "~/components/CustomerForm";

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
                    <CustomerForm
                        errors={actionData?.errors}
                        submitLabel="Create Customer"
                    />
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
