import { Router } from 'express';
import * as ctrl from '../controllers/orderController.js';
import { adminAuth } from '../middleware/auth.js';

const router = Router();

router.get('/', ctrl.list);
router.get('/:id', ctrl.getById);
router.post('/', ctrl.create);
router.put('/:id/status', adminAuth, ctrl.updateStatus);

export default router;
