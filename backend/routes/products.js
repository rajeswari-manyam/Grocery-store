import { Router } from 'express';
import * as ctrl from '../controllers/productController.js';
import { adminAuth } from '../middleware/auth.js';

const router = Router();

router.get('/', ctrl.list);
router.get('/:id', ctrl.getById);
router.post('/', adminAuth, ctrl.create);
router.put('/:id', adminAuth, ctrl.update);
router.delete('/:id', adminAuth, ctrl.remove);
router.delete('/', adminAuth, ctrl.clearAll);

export default router;
