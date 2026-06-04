import { Router } from 'express';
import * as ctrl from '../controllers/profileController.js';
import { userAuth } from '../middleware/auth.js';

const router = Router();

router.get('/', userAuth, ctrl.getProfile);
router.put('/', userAuth, ctrl.updateProfile);
router.post('/addresses', userAuth, ctrl.addAddress);
router.put('/addresses/:id', userAuth, ctrl.updateAddress);
router.delete('/addresses/:id', userAuth, ctrl.deleteAddress);

export default router;
