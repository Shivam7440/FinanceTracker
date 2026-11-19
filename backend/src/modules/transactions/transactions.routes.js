import { Router } from 'express';
import {
  getTransactions,
  getTransactionById,
  createTransaction,
  updateTransaction,
  deleteTransaction
} from './transactions.controller.js';
import { authenticate } from '../../middleware/auth.js';
import { authorize, preventReadOnlyMutations } from '../../middleware/rbac.js';
import { transactionLimiter } from '../../middleware/rateLimiter.js';

const router = Router();

// Apply rate limiter to all transaction operations (100 req / hour)
router.use(transactionLimiter);
router.use(authenticate);

// View list & details — available to admin, user, read-only
router.get('/', getTransactions);
router.get('/:id', getTransactionById);

// Mutations — available to admin & user only; read-only accounts rejected by backend middleware
router.post('/', authorize('admin', 'user'), preventReadOnlyMutations, createTransaction);
router.put('/:id', authorize('admin', 'user'), preventReadOnlyMutations, updateTransaction);
router.delete('/:id', authorize('admin', 'user'), preventReadOnlyMutations, deleteTransaction);

export default router;
