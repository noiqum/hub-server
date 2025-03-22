import { z } from 'zod';

// Request schemas
export const createCommentSchema = z.object({
    content: z.string({ required_error: "Content is required" }),
    ranking: z.number().min(0).max(5).optional().default(0),
});

// Response types
export type CommentResponseDto = z.infer<typeof commentResponseSchema>;
export type CreateCommentDto = z.infer<typeof createCommentSchema>;

// Response schema (for type inference)
const commentResponseSchema = z.object({
    id: z.string().uuid(),
    user_id: z.string().uuid(),
    listing_id: z.string().uuid(),
    content: z.string(),
    created_at: z.string().or(z.date()),
    updated_at: z.string().or(z.date()),
    ranking: z.number(),
});