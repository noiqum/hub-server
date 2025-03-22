

import { z } from 'zod';
import { commentResponseSchema } from './commentSchemas'; // Adjust the path as needed

export type listing_type = "house" | "land" | "office";

// Request schemas
export const createListingSchema = z.object({
    type: z.string({ required_error: "Type is required" }),
    title: z.string({ required_error: "Title is required" }),
    user_id: z.string({ required_error: "User ID is required" }).uuid(),
    description: z.string({ required_error: "Description is required" }),
    price: z.number({ required_error: "Price is required" }).positive(),
    area: z.number().positive().optional(),
    image_urls: z.array(z.string()).optional(),
    latitude: z.number().optional(),
    longitude: z.number().optional(),

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
    image_urls: z.array(z.string()).optional(),
    user_id: z.string().uuid(),
    comments: z.array(commentResponseSchema).optional(),
    created_at: z.string().or(z.date()),
    updated_at: z.string().or(z.date()),
});