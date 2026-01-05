import type { Route } from "./+types/customers.$id";
import { useLoaderData, useActionData, redirect } from "react-router";
import { ObjectId } from "mongodb";
import { getCollection, Collections } from "~/lib/db/db.server";
import type { Customer, SerializedCustomer, CustomerStatus } from "~/types/customer";
import { CustomerForm } from "~/components/CustomerForm";

/**
 * Loader function - fetches a single customer by ID
 * 
 * FLOW:
 * 1. Extract id from route params
 * 2. Validate ObjectId format
 * 3. Query MongoDB for customer
 * 4. Handle not-found case
 * 5. Serialize and return customer data
 * 
 * TYPE SAFETY:
 * - Uses Route.LoaderArgs for typed params
 * - Returns SerializedCustomer (ObjectId and Date converted to strings)
 */
export async function loader({ params }: Route.LoaderArgs): Promise<SerializedCustomer> {
    const { id } = params;

    // Validate ObjectId format (24-character hex string)
    if (!id || !ObjectId.isValid(id)) {
        throw new Response("Invalid customer ID", { status: 400 });
    }

    try {
        // Get typed MongoDB collection
        const collection = await getCollection<Customer>(Collections.CUSTOMERS);

        // Fetch customer by ID
        const customer = await collection.findOne({ _id: new ObjectId(id) });

        // Handle not-found case
        if (!customer) {
            throw new Response("Customer not found", { status: 404 });
        }

        // Serialize MongoDB document for JSON response
        const serializedCustomer: SerializedCustomer = {
            ...customer,
            _id: customer._id.toString(),
            createdAt: customer.createdAt.toISOString(),
            updatedAt: customer.updatedAt.toISOString(),
        };

        return serializedCustomer;
    } catch (error) {
        // Re-throw Response errors (404, 400)
        if (error instanceof Response) {
            throw error;
        }

        console.error("Failed to fetch customer:", error);
        throw new Response("Failed to load customer", { status: 500 });
    }
}

/**
 * Action function - handles customer update submission
 * 
 * FLOW:
 * 1. Extract form data from request
 * 2. Validate required fields
 * 3. Update MongoDB using $set operator
 * 4. Set updatedAt using $currentDate
 * 5. Redirect to customers list
 * 
 * TYPE SAFETY:
 * - Uses Route.ActionArgs for typed request and params
 * - Returns validation errors or redirect response
 */
export async function action({ request, params }: Route.ActionArgs) {
    const { id } = params;

    // Validate ObjectId format
    if (!id || !ObjectId.isValid(id)) {
        return {
            errors: {
                _form: "Invalid customer ID",
            },
        };
    }

    // Extract form data from POST request
    const formData = await request.formData();

    // Get form field values
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

        // Build update document using $set operator
        const updateDoc = {
            $set: {
                name: name.trim(),
                email: email.trim(),
                status,
                tags: tagArray,
                // Spread operator for optional fields
                ...(phone && { phone: phone.trim() }),
                ...(company && { company: company.trim() }),
                ...(notes && { notes: notes.trim() }),
            },
            // Automatically set updatedAt to current date
            $currentDate: {
                updatedAt: true,
            },
        } as any; // Type assertion needed for MongoDB update operators

        // Update customer in MongoDB
        const result = await collection.updateOne(
            { _id: new ObjectId(id) },
            updateDoc
        );

        // Check if customer was found and updated
        if (result.matchedCount === 0) {
            return {
                errors: {
                    _form: "Customer not found",
                },
            };
        }

        // Redirect to customers list after success
        return redirect("/customers");
    } catch (error) {
        console.error("Failed to update customer:", error);
        return {
            errors: {
                _form: "Failed to update customer. Please try again.",
            },
        };
    }
}

/**
 * Edit Customer Page Component
 */
export default function EditCustomer() {
    // Get loader data (customer to edit)
    const customer = useLoaderData<typeof loader>();

    // Get action data (validation errors if any)
    const actionData = useActionData<typeof action>();

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
            <div className="container mx-auto px-4 py-8 max-w-2xl">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50">
                        Edit Customer
                    </h1>
                    <p className="text-slate-600 dark:text-slate-400 mt-2">
                        Update customer information
                    </p>
                </div>

                {/* Form */}
                <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
                    <CustomerForm
                        errors={actionData?.errors}
                        defaultValues={customer}
                        submitLabel="Update Customer"
                    />
                </div>
            </div>
        </div>
    );
}

/**
 * Meta tags for SEO
 */
export function meta({ data }: Route.MetaArgs) {
    const customer = data as SerializedCustomer | undefined;

    return [
        { title: customer ? `Edit ${customer.name} | Merchant Contact Manager` : "Edit Customer | Merchant Contact Manager" },
        { name: "description", content: "Edit customer information" },
    ];
}
