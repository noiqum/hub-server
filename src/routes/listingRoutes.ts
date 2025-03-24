import { Router } from 'express';
import {
    getAllListings,
    getListingById,
    createListing,
    updateListing,
    deleteListing,
    addComment,
    getListingComments,
    getListingTypes
} from '../controllers/listingController';

import { validate } from '../middleware/validationMiddleware';
import { createListingSchema, updateListingSchema } from '../schemas/listingSchemas';
import { createCommentSchema } from '../schemas/commentSchemas';
import authMiddleware from '../middleware/authMiddleware';

const router = Router();

// Public routes
router.get('/', getAllListings);
router.get('/:id', getListingById);
router.get('/:listing_id/comments', getListingComments);
router.get("/types", getListingTypes);

// Protected routes (require authentication)
router.post('/', authMiddleware, validate(createListingSchema), createListing);
router.put('/:id', authMiddleware, validate(updateListingSchema.innerType()), updateListing);
router.delete('/:id', authMiddleware, deleteListing);
router.post('/:listing_id/comments', authMiddleware, validate(createCommentSchema), addComment);

export default router;