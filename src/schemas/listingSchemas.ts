

import { z } from 'zod';

// Request schemas
export const createListingSchema = z.object({
    title: z.string({ required_error: "Title is required" }),
    description: z.string({ required_error: "Description is required" }),
    price: z.number({ required_error: "Price is required" }).positive(),
    area: z.number().positive().optional(),
    // Add other fields as needed
});

export const updateListingSchema = z.object({
    title: z.string().optional(),
    description: z.string().optional(),
    price: z.number().positive().optional(),
    area: z.number().positive().optional(),
}).refine(data => Object.keys(data).length > 0, {
    message: "At least one field must be provided for update"
});

// Response types
export type ListingResponseDto = z.infer<typeof listingResponseSchema>;
export type CreateListingDto = z.infer<typeof createListingSchema>;
export type UpdateListingDto = z.infer<typeof updateListingSchema>;

// Response schema (for type inference)
const listingResponseSchema = z.object({
    id: z.string().uuid(),
    title: z.string(),
    description: z.string(),
    price: z.number(),
    area: z.number().optional(),
    created_at: z.string().or(z.date()),
    updated_at: z.string().or(z.date()),
});