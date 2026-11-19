import { Router } from 'express';
import { getUsers, updateUserRole } from './users.controller.js';
import { authenticate } from '../../middleware/auth.js';
import { authorize } from '../../middleware/rbac.js';

const router = Router();

// Strict RBAC: All user management endpoints require authenticated admin
router.use(authenticate);
router.use(authorize('admin'));

router.get('/', getUsers);
router.patch('/:id/role', updateUserRole);

export default router;
