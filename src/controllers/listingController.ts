// src/controllers/listingController.ts

import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import supabase from '../config/supabase';
import { sendSuccess, sendError, sendPaginatedSuccess } from '../utils/responseUtils';
import { ListingResponseDto, CreateListingDto, UpdateListingDto } from '../schemas/listingSchemas';
import { CommentResponseDto, CreateCommentDto } from '../schemas/commentSchemas';

// Get all listings with pagination
export const getAllListings = async (req: Request, res: Response): Promise<void> => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const startIndex = (page - 1) * limit;

        // Get total count
        const { count, error: countError } = await supabase
            .from('listings')
            .select('*', { count: 'exact', head: true });

        if (countError) throw countError;

        // Get paginated data
        const { data, error } = await supabase
            .from('listings')
            .select('*')
            .range(startIndex, startIndex + limit - 1)
            .order('created_at', { ascending: false });

        if (error) throw error;

        sendPaginatedSuccess<ListingResponseDto[]>(
            res,
            data,
            count ?? 0,
            page,
            limit,
            'Listings retrieved successfully'
        );
    } catch (error) {
        sendError(res, (error as Error).message || 'Failed to retrieve listings');
    }
};

// Get a single listing by ID
export const getListingById = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;

        const { data, error } = await supabase
            .from('listings')
            .select(`
        *,
        comments(*)
      `)
            .eq('id', id)
            .single();

        if (error) throw error;

        if (!data) {
            sendError(res, 'Listing not found', 404);
            return;
        }

        sendSuccess<ListingResponseDto>(
            res,
            data,
            'Listing retrieved successfully'
        );
    } catch (error) {
        sendError(res, (error as Error).message || 'Failed to retrieve listing');
    }
};

// Create a new listing
export const createListing = async (req: Request, res: Response): Promise<void> => {
    try {
        const listingData: CreateListingDto = req.body;

        const { data, error } = await supabase
            .from('listings')
            .insert([
                {
                    id: uuidv4(),
                    ...listingData,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                }
            ])
            .select();

        if (error) throw error;

        sendSuccess<ListingResponseDto>(
            res,
            data[0],
            'Listing created successfully',
            201
        );
    } catch (error) {
        sendError(res, (error as Error).message || 'Failed to create listing');
    }
};

// Update a listing
export const updateListing = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const listingData: UpdateListingDto = req.body;

        const { data, error } = await supabase
            .from('listings')
            .update({
                ...listingData,
                updated_at: new Date().toISOString()
            })
            .eq('id', id)
            .select();

        if (error) throw error;

        if (data.length === 0) {
            sendError(res, 'Listing not found', 404);
            return;
        }

        sendSuccess<ListingResponseDto>(
            res,
            data[0],
            'Listing updated successfully'
        );
    } catch (error) {
        sendError(res, (error as Error).message || 'Failed to update listing');
    }
};

// Delete a listing
export const deleteListing = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;

        const { error } = await supabase
            .from('listings')
            .delete()
            .eq('id', id);

        if (error) throw error;

        sendSuccess(
            res,
            null,
            'Listing deleted successfully'
        );
    } catch (error) {
        sendError(res, (error as Error).message || 'Failed to delete listing');
    }
};

// Add a comment to a listing
export const addComment = async (req: Request, res: Response): Promise<void> => {
    try {
        const { listing_id } = req.params;
        const commentData: CreateCommentDto = req.body;
        const user_id = req.user.id; // Assuming you have authentication middleware

        const { data, error } = await supabase
            .from('comments')
            .insert([
                {
                    id: uuidv4(),
                    user_id,
                    listing_id,
                    content: commentData.content,
                    ranking: commentData.ranking || 0,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                }
            ])
            .select();

        if (error) throw error;

        sendSuccess<CommentResponseDto>(
            res,
            data[0],
            'Comment added successfully',
            201
        );
    } catch (error) {
        sendError(res, (error as Error).message || 'Failed to add comment');
    }
};

// Get all comments for a listing
export const getListingComments = async (req: Request, res: Response): Promise<void> => {
    try {
        const { listing_id } = req.params;
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const startIndex = (page - 1) * limit;

        // Get total count
        const { count, error: countError } = await supabase
            .from('comments')
            .select('*', { count: 'exact', head: true })
            .eq('listing_id', listing_id);

        if (countError) throw countError;

        // Get paginated data
        const { data, error } = await supabase
            .from('comments')
            .select('*')
            .eq('listing_id', listing_id)
            .range(startIndex, startIndex + limit - 1)
            .order('created_at', { ascending: false });

        if (error) throw error;

        sendPaginatedSuccess<CommentResponseDto[]>(
            res,
            data,
            count ?? 0,
            page,
            limit,
            'Comments retrieved successfully'
        );
    } catch (error) {
        sendError(res, (error as Error).message || 'Failed to retrieve comments');
    }
};