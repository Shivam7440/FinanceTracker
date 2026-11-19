import { Router } from 'express';
import { getCategories, createCategory } from './categories.controller.js';
import { authenticate } from '../../middleware/auth.js';
import { authorize } from '../../middleware/rbac.js';

const router = Router();

// All authenticated roles can view categories
router.get('/', authenticate, getCategories);

// Only admin can create categories
router.post('/', authenticate, authorize('admin'), createCategory);

export default router;
